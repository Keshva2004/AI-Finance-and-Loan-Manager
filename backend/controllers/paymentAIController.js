import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import moment from "moment";
import Payment from "../database/models/payment.js";
import Client from "../database/models/client.js";
import Loan from "../database/models/loan.js";

dotenv.config();

const PREFERRED_MODEL = "gemini-2.5-flash";

let ai;
try {
  if (!process.env.GEMINI_KEY) {
    throw new Error("GEMINI_KEY missing in .env file");
  }
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_KEY,
  });
  console.log("Gemini client initialized successfully");
} catch (err) {
  console.error("Failed to initialize Gemini:", err.message);
}

function extractAIText(response) {
  return response?.text || JSON.stringify(response);
}

export const processPaymentCommand = async (req, res) => {
  try {
    const { voiceCommand } = req.body;
    if (!voiceCommand)
      return res
        .status(400)
        .json({ status: "error", message: "voiceCommand is required" });

    const prompt = `
      You are an AI that converts finance admin voice commands into explicit MongoDB update/delete/add instructions for payments.
      Format strictly as:
        Add payment for <borrowerName> with amount <amount>, date <date>, method <method>, status <status>, notes <notes>
        Update payment for <borrowerName> on <date> <field> to <value>
        Delete payment for <borrowerName> on <date>
      Allowed fields: paymentAmount, paymentDate, paymentMethod, status, notes.
      Dates must be in MM/DD/YYYY or YYYY-MM-DD.
      Reply "AMBIGUOUS" if unclear.
      Command: "${voiceCommand}"
    `;

    let response;
    for (let i = 0; i < 3; i++) {
      try {
        response = await ai.models.generateContent({
          model: PREFERRED_MODEL,
          contents: prompt,
        });
        break;
      } catch (e) {
        console.error(`AI call failed, retrying in ${2 ** i}s...`);
        await new Promise((resolve) => setTimeout(resolve, 2 ** i * 1000));
        if (i === 2) throw e;
      }
    }
    if (!response) {
      return res.status(500).json({
        status: "error",
        message: "AI call failed after all retries.",
      });
    }

    const raw = extractAIText(response);
    console.log("AI raw output:", raw);

    if (!raw)
      return res
        .status(500)
        .json({ status: "error", message: "Empty AI response" });

    const instruction = raw.trim();

    if (/ambiguous/i.test(instruction))
      return res
        .status(200)
        .json({ status: "ambiguous", aiInstruction: instruction });

    const result = await handleDatabaseUpdate(instruction);

    if (result.action === "error") {
      return res.status(404).json({
        status: "error",
        aiInstruction: instruction,
        message: result.message,
      });
    }
    return res.json({ status: "success", aiInstruction: instruction, result });
  } catch (error) {
    console.error("process-payment-command error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Unexpected error",
    });
  }
};

//Database Handling Functions

async function handleDatabaseUpdate(instruction) {
  let match;

  // Add payment
  match = instruction.match(
    /add payment for\s+(.+?)\s+with\s+amount\s*([\d,]+(?:\.\d+)?)\s*,?\s*date\s*([\d/-]+)\s*,?\s*method\s*(Cash|Bank Transfer|Cheque|Online|Other)\s*,?\s*status\s*(Pending|Completed|Failed|Refunded)\s*,?\s*notes\s*(.+)?/i
  );
  if (match) {
    const [_, borrowerName, rawAmount, dateStr, method, status, notes] = match;

    const cleanAmount = rawAmount.replace(/,/g, "");
    const date = moment(dateStr, ["YYYY-MM-DD", "DD/MM/YYYY"], true);
    if (!date.isValid())
      return { action: "error", message: "Invalid date format" };

    const borrower = await Client.findOne({
      full_name: new RegExp(`^${borrowerName.trim()}$`, "i"),
    });
    if (!borrower)
      return {
        action: "error",
        message: `Borrower "${borrowerName}" not found`,
      };

    const loan = await Loan.findOne({ borrowerId: borrower._id });
    if (!loan)
      return {
        action: "error",
        message: `No loan found for borrower "${borrowerName}"`,
      };

    const paymentData = {
      borrowerId: borrower._id,
      loanId: loan._id,
      paymentAmount: parseFloat(cleanAmount),
      paymentDate: date.toDate(),
      paymentMethod: method,
      status,
      notes: notes ? notes.trim() : "",
    };

    return addPayment(paymentData);
  }

  // Update payment
  match = instruction.match(
    /update payment for\s+(.+?)\s+on\s*([\d/-]+)\s+(paymentAmount|paymentDate|paymentMethod|status|notes)\s+to\s+(.+)/i
  );
  if (match) {
    const [_, borrowerName, dateStr, field, rawValue] = match;
    const date = moment(dateStr, ["YYYY-MM-DD", "DD/MM/YYYY"], true);
    if (!date.isValid())
      return { action: "error", message: "Invalid date format for update" };

    const borrower = await Client.findOne({
      full_name: new RegExp(`^${borrowerName.trim()}$`, "i"),
    });
    if (!borrower)
      return {
        action: "error",
        message: `Borrower "${borrowerName}" not found`,
      };

    const payment = await Payment.findOne({
      borrowerId: borrower._id,
      paymentDate: date.toDate(),
    });
    if (!payment)
      return {
        action: "error",
        message: `Payment not found for "${borrowerName}" on ${dateStr}`,
      };

    const update = {};
    let value = rawValue.trim();

    if (field === "paymentAmount") {
      value = parseFloat(value.replace(/,/g, ""));
      if (isNaN(value) || value < 0)
        return { action: "error", message: "Invalid payment amount" };
    } else if (field === "paymentDate") {
      const newDate = moment(value, ["YYYY-MM-DD", "DD/MM/YYYY"], true);
      if (!newDate.isValid())
        return {
          action: "error",
          message: "Invalid date format for paymentDate update",
        };
      value = newDate.toDate();
    } else if (field === "status") {
      const validStatuses = ["Pending", "Completed", "Failed", "Refunded"];
      if (!validStatuses.includes(value))
        return {
          action: "error",
          message: `Invalid status: must be one of ${validStatuses.join(", ")}`,
        };
    } else if (field === "notes") {
      // notes is string, trim
    } else if (field === "paymentMethod") {
      const validMethods = [
        "Cash",
        "Bank Transfer",
        "Cheque",
        "Online",
        "Other",
      ];
      if (!validMethods.includes(value))
        return {
          action: "error",
          message: `Invalid method: must be one of ${validMethods.join(", ")}`,
        };
    }

    update[field] = value;
    return updatePayment(payment._id, update);
  }

  // Delete payment
  match = instruction.match(/delete payment for\s+(.+?)\s+on\s*([\d/-]+)/i);
  if (match) {
    const [_, borrowerName, dateStr] = match;
    const date = moment(dateStr, ["YYYY-MM-DD", "DD/MM/YYYY"], true);
    if (!date.isValid())
      return { action: "error", message: "Invalid date format for delete" };

    const borrower = await Client.findOne({
      full_name: new RegExp(`^${borrowerName.trim()}$`, "i"),
    });
    if (!borrower)
      return {
        action: "error",
        message: `Borrower "${borrowerName}" not found`,
      };

    const payment = await Payment.findOne({
      borrowerId: borrower._id,
      paymentDate: date.toDate(),
    });
    if (!payment)
      return {
        action: "error",
        message: `Payment not found for "${borrowerName}" on ${dateStr}`,
      };

    return deletePayment(payment._id);
  }

  return { action: "none", message: "No valid pattern detected" };
}

// Helpers
async function addPayment(paymentData) {
  const newPayment = await Payment.create(paymentData);
  return {
    action: "add",
    success: true,
    message: "Payment added successfully",
    doc: newPayment,
  };
}

async function updatePayment(id, update) {
  const updated = await Payment.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
  if (!updated) return { action: "error", message: "Payment update failed." };
  return { action: "update", success: true, doc: updated };
}

async function deletePayment(id) {
  await Payment.deleteOne({ _id: id });
  return {
    action: "delete",
    success: true,
    message: "Payment deleted successfully",
  };
}
