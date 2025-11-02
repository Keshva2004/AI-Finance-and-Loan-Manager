// database/models/loan.js
import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    // Borrower reference (to Client)
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    // Loan details
    loanType: {
      type: String,
      required: true,
      enum: ["Home", "Auto", "Personal", "Education", "Business"],
    },
    loanAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    interestRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    loanTermYears: {
      type: Number,
      required: true,
      min: 1,
    },

    // Loan duration
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    // Loan status
    status: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
        "Active",
        "Paid Off",
        "Defaulted",
      ],
      default: "Pending",
    },

    // Collateral
    collateral: {
      name: { type: String, trim: true },
      description: { type: String, trim: true },
      value: { type: Number, min: 0 },
    },

    // Calculated fields
    monthlyEMI: {
      type: Number,
      default: 0,
    },
    totalInterest: {
      type: Number,
      default: 0,
    },
    totalPayment: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes
loanSchema.index({ borrowerId: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ startDate: 1 });

// Pre-save hook: Recalculate when key fields change, including monthlyEMI (Safer Version with Validation)
loanSchema.pre("save", function (next) {
  try {
    const isNewOrModified =
      this.isNew ||
      this.isModified("loanAmount") ||
      this.isModified("interestRate") ||
      this.isModified("loanTermYears") ||
      this.isModified("startDate") ||
      this.isModified("monthlyEMI");

    if (isNewOrModified) {
      const P = this.loanAmount || 0;
      const r = (this.interestRate || 0) / (12 * 100);
      const n = (this.loanTermYears || 0) * 12;

      // Ensure valid inputs to prevent NaN
      if (P <= 0 || r < 0 || n <= 0) {
        console.warn(
          "⚠️ Pre-save: Invalid inputs for calculation (P, r, n):",
          P,
          r,
          n
        );
        // Skip recalc if invalid, but don't fail the save
        return next();
      }

      if (this.isModified("monthlyEMI") && this.monthlyEMI > 0) {
        // If EMI is edited, recalculate totals based on new EMI (assuming term fixed)
        const totalAmt = this.monthlyEMI * n;
        this.totalPayment = Math.round(totalAmt);
        this.totalInterest = Math.round(totalAmt - P);
      } else {
        // Standard recalculation
        const emiValue =
          (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) || 0;
        if (isNaN(emiValue) || !isFinite(emiValue)) {
          console.warn(
            "⚠️ Pre-save: EMI calculation resulted in NaN/Inf:",
            emiValue
          );
          return next(); // Skip recalc, don't fail save
        }
        const totalAmt = emiValue * n;
        this.monthlyEMI = Math.round(emiValue);
        this.totalInterest = Math.round(totalAmt - P);
        this.totalPayment = Math.round(totalAmt);
      }

      // Recalculate end date if term or start changes
      if (this.isModified("loanTermYears") || this.isModified("startDate")) {
        const start = new Date(this.startDate);
        if (!isNaN(start.getTime())) {
          this.endDate = new Date(
            start.getFullYear(),
            start.getMonth() + n,
            start.getDate()
          );
        }
      }
    }

    next();
  } catch (err) {
    console.error("❌ Pre-save hook error:", err);
    next(err); // Pass error to fail the save if needed
  }
});

export default mongoose.model("Loan", loanSchema);
