import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import moment from "moment";
import stringSimilarity from "string-similarity"; // Use default import
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

export const processCommand = async (req, res) => {
  try {
    const { voiceCommand } = req.body;
    if (!voiceCommand)
      return res
        .status(400)
        .json({ status: "error", message: "voiceCommand is required" });

    const prompt = `
      You are an AI that converts finance admin voice commands into explicit MongoDB update/delete/add instructions for Payments.
      Normalize borrower and loan names: Remove extra spaces, correct common typos and use approximate matching for spelling variations.
      Format strictly as:
        Add payment for <borrowerName> on <loanType> loan with amount <amount>, method <method>, status <status>, date <date>, notes <notes>
        Update payment for <borrowerName> on <loanType> loan <field> to <value>
        Delete payment for <borrowerName> on <loanType> loan
        Delete payment for <borrowerName> on <loanType> loan where <field> is <value>
      Allowed fields: paymentAmount, paymentDate, paymentMethod, status, notes.
      NOTE: Dates must be in MM/DD/YYYY or YYYY-MM-DD format.
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
    console.error("process-command error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Unexpected error",
    });
  }
};

async function findClosestBorrower(name) {
  const clients = await Client.find({}, "full_name");
  if (!name) return null;
  const names = clients.map((c) => (c.full_name ? c.full_name.toLowerCase() : ""));
  const matched = stringSimilarity.findBestMatch(name.toLowerCase(), names);
  if (!matched.bestMatch) return null;
  if (matched.bestMatch.rating > 0.75) {
    return clients[matched.bestMatchIndex];
  }
  return null;
}

async function findClosestLoan(borrowerId, loanType) {
  const loans = await Loan.find({ borrowerId }, "loanType");
  if (!loanType) return null; // if loan type is empty, return null

  const types = loans.map((l) => l.loanType).filter(Boolean); // Filter out falsy

  if (types.length === 0) {
    // No loans found for borrower, can't find a match
    return null;
  }

  // Use stringSimilarity only if types array is not empty
  const matched = stringSimilarity.findBestMatch(
    loanType.toLowerCase(),
    types.map((t) => t.toLowerCase())
  );

  if (!matched.bestMatch) return null;

  if (matched.bestMatch.rating > 0.75) {
    return loans[matched.bestMatchIndex];
  }

  return null;
}

async function addPayment(paymentData) {
  const borrower = await findClosestBorrower(paymentData.borrowerName);
  if (!borrower)
    return {
      action: "error",
      message: `Borrower "${paymentData.borrowerName}" not found.`,
    };
  const loan = await findClosestLoan(borrower._id, paymentData.loanType);
  if (!loan)
    return {
      action: "error",
      message: `Loan "${paymentData.loanType}" not found for borrower.`,
    };
  const payload = {
    borrowerId: borrower._id,
    loanId: loan._id,
    paymentAmount: paymentData.paymentAmount,
    paymentDate: paymentData.paymentDate,
    paymentMethod: paymentData.paymentMethod,
    status: paymentData.status,
    notes: paymentData.notes,
  };
  const newPayment = await Payment.create(payload);
  return {
    action: "add",
    success: true,
    message: "Payment added successfully",
    doc: newPayment,
  };
}

async function updatePayment(borrowerName, loanType, update) {
  const borrower = await findClosestBorrower(borrowerName);
  if (!borrower)
    return {
      action: "error",
      message: `Borrower "${borrowerName}" not found.`,
    };
  const loan = await findClosestLoan(borrower._id, loanType);
  if (!loan)
    return {
      action: "error",
      message: `Loan "${loanType}" not found for borrower.`,
    };
  const payment = await Payment.findOne({ loanId: loan._id }).sort({ createdAt: -1 });
  if (!payment)
    return { action: "error", message: "No payment found for this loan" };
  const updated = await Payment.findByIdAndUpdate(payment._id, update, {
    new: true,
    runValidators: true,
  });
  return { action: "update", success: true, doc: updated };
}

async function deletePayment(borrowerName, loanType, filter = {}) {
  const borrower = await findClosestBorrower(borrowerName);
  if (!borrower)
    return { action: "error", message: `Borrower "${borrowerName}" not found.` };
  const loan = await findClosestLoan(borrower._id, loanType);
  if (!loan)
    return { action: "error", message: `Loan "${loanType}" not found for borrower.` };
  const query = { loanId: loan._id, ...filter };
  const deleted = await Payment.findOneAndDelete(query);
  if (!deleted) return { action: "error", message: "Payment not found" };
  return { action: "delete", success: true, message: "Payment deleted" };
}

async function handleDatabaseUpdate(instruction) {
  let match;
  // Add payment
  match = instruction.match(
    /add payment for\s+(.+?)\s+on\s+(.+?)\s+loan\s+with\s+amount\s*([\d,]+(?:\.\d+)?)\s*,?\s*method\s*([^\s,]+)\s*,?\s*status\s*(pending|completed|failed|refunded)\s*,?\s*date\s*([\d/-]+)\s*,?\s*notes?\s*(.+)?/i
  );
  if (match) {
    const [
      _,
      borrowerName,
      loanType,
      rawAmount,
      paymentMethod,
      status,
      dateStr,
      notes,
    ] = match;
    const cleanAmount = parseFloat(rawAmount.replace(/,/g, ""));
    const paymentDate = moment(dateStr, ["YYYY-MM-DD", "DD/MM/YYYY"], true);
    if (!paymentDate.isValid())
      return { action: "error", message: "Invalid date format" };
    const paymentData = {
      borrowerName: borrowerName.trim(),
      loanType: loanType.trim(),
      paymentAmount: cleanAmount,
      paymentMethod: paymentMethod.trim(),
      status: status.charAt(0).toUpperCase() + status.slice(1),
      paymentDate: paymentDate.toDate(),
      notes: notes ? notes.trim() : "",
    };
    return addPayment(paymentData);
  }
  // Update payment
  match = instruction.match(
    /update payment for\s+(.+?)\s+on\s+(.+?)\s+loan\s+(paymentAmount|paymentDate|paymentMethod|status|notes)\s+to\s+(.+)/i
  );
  if (match) {
    const [_, borrowerName, loanType, field, rawValue] = match;
    const update = {};
    let value = rawValue.trim();
    if (field === "paymentAmount") {
      value = parseFloat(value.replace(/,/g, ""));
      if (isNaN(value))
        return { action: "error", message: "Invalid payment amount format" };
    } else if (field === "paymentDate") {
      const date = moment(value, ["YYYY-MM-DD", "DD/MM/YYYY"], true);
      if (!date.isValid())
        return { action: "error", message: "Invalid date format for update" };
      value = date.toDate();
    } else if (field === "status") {
      value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }
    update[field] = value;
    return updatePayment(borrowerName.trim(), loanType.trim(), update);
  }
  // Delete payment
  match = instruction.match(/delete payment for\s+(.+?)\s+on\s+(.+?)\s+loan$/i);
  if (match) {
    const [_, borrowerName, loanType] = match;
    return deletePayment(borrowerName.trim(), loanType.trim());
  }
  match = instruction.match(
    /delete payment for\s+(.+?)\s+on\s+(.+?)\s+loan\s+where\s+(paymentAmount|paymentDate|paymentMethod|status|notes)\s+is\s+(.+)/i
  );
  if (match) {
    const [_, borrowerName, loanType, field, value] = match;
    return deletePayment(borrowerName.trim(), loanType.trim(), { [field]: value });
  }
  return { action: "none", message: "No valid pattern detected" };
}