// controllers/loanController.js
import Loan from "../database/models/loan.js";

// ✅ Create Loan
export const createLoan = async (req, res) => {
  try {
    const loan = new Loan(req.body);
    await loan.save();
    res.status(201).json(loan);
  } catch (err) {
    console.error("Create Loan Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get all loans (populates borrower for display)
export const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate("borrowerId", "full_name email")
      .sort({ createdAt: 1 });
    res.status(200).json(loans);
  } catch (err) {
    console.error("Get Loans Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Update by _id (Corrected with enhanced logging for debugging)
export const updateLoan = async (req, res) => {
  console.log(
    "🔄 Backend: Update request received for ID:",
    req.params.id,
    "Body:",
    req.body
  ); // Confirm request arrives

  try {
    const { id } = req.params;
    const loan = await Loan.findById(id);
    if (!loan) {
      console.error("❌ Backend: Loan not found for ID:", id);
      return res.status(404).json({ error: "Loan not found" });
    }

    console.log("📋 Backend: Original loan data:", loan.toObject());

    // Apply updates
    Object.keys(req.body).forEach((key) => {
      loan[key] = req.body[key];
      console.log(
        `🔧 Backend: Setting ${key} to ${req.body[key]} (type: ${typeof req
          .body[key]})`
      );
    });

    console.log("📝 Backend: Modified fields:", loan.modifiedPaths());

    // Attempt save
    console.log("💾 Backend: Attempting save...");
    const updatedLoan = await loan.save();
    console.log(
      "✅ Backend: Save successful. Updated data:",
      updatedLoan.toObject()
    );

    res.status(200).json(updatedLoan);
  } catch (err) {
    console.error("❌ Backend: Save failed with error:", err.message);
    if (err.name === "ValidationError") {
      console.error("Validation Errors:", err.errors);
    } else if (err.name === "CastError") {
      console.error("Cast Error:", err);
    } else {
      console.error("Other Error:", err);
    }
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete by _id
export const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await Loan.findByIdAndDelete(id);
    if (!loan) return res.status(404).json({ error: "Loan not found" });
    res.status(200).json({ message: "Loan deleted successfully" });
  } catch (err) {
    console.error("Delete Loan Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get loan by ID
export const getLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await Loan.findById(id).populate(
      "borrowerId",
      "full_name email"
    );
    if (!loan) return res.status(404).json({ error: "Loan not found" });
    res.status(200).json(loan);
  } catch (err) {
    console.error("Get Loan by ID Error:", err);
    res.status(400).json({ error: err.message });
  }
};
