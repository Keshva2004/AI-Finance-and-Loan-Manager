// controllers/underwritingController.js
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Loan from "../database/models/loan.js";
import Document from "../database/models/document.js";
import Client from "../database/models/client.js";

dotenv.config();

const PREFERRED_MODEL = "gemini-2.5-flash";

let ai;
try {
  if (process.env.GEMINI_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_KEY,
    });
    console.log("✅ Underwriting Controller: Gemini client initialized successfully");
  } else {
    console.warn("⚠️ Underwriting Controller: GEMINI_KEY is missing in .env file");
  }
} catch (err) {
  console.error("❌ Underwriting Controller: Failed to initialize Gemini:", err.message);
}

export const underwriteLoan = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch the Loan and populate borrower details
    const loan = await Loan.findById(id).populate("borrowerId");
    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    const client = loan.borrowerId;
    if (!client) {
      return res.status(404).json({ error: "Borrower details not found for this loan" });
    }

    // 2. Fetch all uploaded KYC documents for this client
    const uploadedDocs = await Document.find({ clientId: client._id });
    const uploadedTypes = uploadedDocs.map((doc) => doc.docType);

    // 3. Define the core required KYC document types
    const requiredTypes = ["PAN Card", "Aadhaar Card", "Election Card", "Photo"];
    const missingDocs = requiredTypes.filter((type) => !uploadedTypes.includes(type));

    // Calculate borrower age
    let age = "N/A";
    if (client.date_of_birth) {
      const dob = new Date(client.date_of_birth);
      const diffMs = Date.now() - dob.getTime();
      const ageDate = new Date(diffMs);
      age = Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    // 4. Verify Gemini Client is available
    if (!ai) {
      return res.status(503).json({
        error: "AI service unavailable. Please configure GEMINI_KEY in the backend .env file.",
      });
    }

    // 5. Construct a professional underwriter prompt
    const prompt = `
      You are a senior credit underwriting officer and KYC compliance auditor at a premium financial institution.
      Analyze the following loan application and borrower details to perform a credit risk evaluation and KYC compliance check.

      BORROWER PROFILE:
      - Name: ${client.full_name}
      - Age: ${age} years
      - Employment Status: ${client.employment_status || "Salaried"}
      - Credit Score: ${client.credit_score || "Not Provided (Assume average 650)"}
      - Address: ${client.address || "N/A"}

      LOAN PARAMETERS:
      - Loan Type: ${loan.loanType} Loan
      - Principal Amount: ₹${loan.loanAmount.toLocaleString("en-IN")}
      - Annual Interest Rate: ${loan.interestRate}%
      - Term Duration: ${loan.loanTermYears} Years
      - Calculated Monthly EMI: ₹${loan.monthlyEMI ? loan.monthlyEMI.toLocaleString("en-IN") : "0"}
      - Total Repayment Obligation: ₹${loan.totalPayment ? loan.totalPayment.toLocaleString("en-IN") : "0"}
      - Total Calculated Interest: ₹${loan.totalInterest ? loan.totalInterest.toLocaleString("en-IN") : "0"}

      KYC DOCUMENT STATUS:
      - Total Uploaded Documents: ${uploadedDocs.length}
      - Uploaded Document Types: ${uploadedTypes.join(", ") || "None"}
      - Mandatory Documents Missing: ${missingDocs.join(", ") || "None"}

      Based on these metrics:
      1. Evaluate KYC compliance (are all 4 mandatory items: Aadhaar, PAN, Photo, and Election Card present?).
      2. Calculate an Affordability Score (0-100) based on Employment Status stability and Loan Amortization parameters.
      3. Weigh credit score parameters (300-900).
      4. Select a qualitative Risk Level (Low, Medium, High).
      5. Synthesize a professional Underwriter Verdict:
         - "Recommended for Approval" (low/medium risk, complete documents)
         - "Needs Manual Review" (moderate risk, minor document gaps)
         - "Recommended for Rejection" (high risk, defaulted parameters, critical gaps)

      You MUST return a JSON object with this EXACT structure:
      {
        "riskLevel": "Low" | "Medium" | "High",
        "riskPercentage": 0-100 (numerical representation of risk),
        "verdict": "Recommended for Approval" | "Needs Manual Review" | "Recommended for Rejection",
        "affordabilityScore": 0-100 (numerical score of client capacity),
        "kycCompliance": {
          "status": "Complete" | "Incomplete",
          "uploaded": ["docType1", ...],
          "missing": ["docType2", ...]
        },
        "bulletPoints": [
          "reasoning point 1",
          "reasoning point 2",
          ...
        ],
        "underwriterSummary": "A concise, professional paragraph summarizing the qualitative risk decision."
      }
      Do NOT return any markdown formatting, backticks, or text other than raw valid JSON.
    `;

    // 6. Execute Gemini Call
    let response;
    for (let i = 0; i < 3; i++) {
      try {
        response = await ai.models.generateContent({
          model: PREFERRED_MODEL,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });
        break;
      } catch (e) {
        console.error(`Gemini Underwriting call failed, retrying in ${2 ** i}s...`, e.message);
        await new Promise((resolve) => setTimeout(resolve, 2 ** i * 1000));
        if (i === 2) throw e;
      }
    }

    if (!response || !response.text) {
      return res.status(500).json({ error: "Empty response from Gemini AI underwriter." });
    }

    // 7. Parse response text
    const cleanJSON = response.text.trim();
    const resultData = JSON.parse(cleanJSON);

    res.status(200).json({
      success: true,
      loanId: loan._id,
      borrowerName: client.full_name,
      ...resultData,
    });
  } catch (error) {
    console.error("❌ Underwriting error:", error);
    res.status(500).json({
      error: error.message || "Unexpected server error during underwriting evaluation.",
    });
  }
};
