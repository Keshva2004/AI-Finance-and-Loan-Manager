import mongoose from "mongoose";
import Loan from "./loan.js"; // Import Loan model for validation/updates

const paymentSchema = new mongoose.Schema(
  {
    // Borrower reference (to Client)
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    // Loan reference (required)
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
    },

    // Payment details
    paymentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Cheque", "Online", "Other"],
      default: "Online",
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Indexes for performance
paymentSchema.index({ loanId: 1 });
paymentSchema.index({ borrowerId: 1 });
paymentSchema.index({ paymentDate: 1 });
paymentSchema.index({ status: 1 });

// Pre-save hook: Validation and loan updates
paymentSchema.pre("save", async function (next) {
  try {
    // Only process if status is "Completed" and it's a new or modified payment
    if (
      this.status === "Completed" &&
      (this.isNew || this.isModified("status"))
    ) {
      const loan = await Loan.findById(this.loanId);
      if (!loan) {
        return next(new Error("Loan not found"));
      }

      // Calculate total payments for this loan (sum of completed payments)
      const totalPaid = await mongoose
        .model("Payment")
        .aggregate([
          { $match: { loanId: this.loanId, status: "Completed" } },
          { $group: { _id: null, total: { $sum: "$paymentAmount" } } },
        ]);
      const currentTotalPaid = totalPaid.length > 0 ? totalPaid[0].total : 0;

      // Add this payment to the total
      const newTotalPaid = currentTotalPaid + this.paymentAmount;

      // Validate: Can't exceed total payment (loan amount + interest)
      if (newTotalPaid > loan.totalPayment) {
        return next(new Error("Payment exceeds total loan amount"));
      }

      // Update loan status if fully paid
      if (newTotalPaid >= loan.totalPayment && loan.status !== "Paid Off") {
        loan.status = "Paid Off";
        await loan.save();
      }
    }

    next();
  } catch (err) {
    console.error("❌ Payment pre-save error:", err);
    next(err);
  }
});

export default mongoose.model("Payment", paymentSchema);
