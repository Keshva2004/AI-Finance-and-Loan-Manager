import Payment from "../database/models/payment.js";

// ✅ Create Payment
export const createPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    console.error("Create Payment Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get all Payments (populates borrower and loan)
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("borrowerId", "full_name email")
      .populate("loanId", "loanType loanAmount totalPayment")
      .sort({ paymentDate: -1 });
    res.status(200).json(payments);
  } catch (err) {
    console.error("Get Payments Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get Payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id)
      .populate("borrowerId", "full_name email")
      .populate("loanId", "loanType loanAmount totalPayment");
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.status(200).json(payment);
  } catch (err) {
    console.error("Get Payment by ID Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Update Payment by _id
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Apply updates
    Object.keys(req.body).forEach((key) => {
      payment[key] = req.body[key];
    });

    const updatedPayment = await payment.save();
    res.status(200).json(updatedPayment);
  } catch (err) {
    console.error("Update Payment Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete Payment by _id
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (err) {
    console.error("Delete Payment Error:", err);
    res.status(400).json({ error: err.message });
  }
};
