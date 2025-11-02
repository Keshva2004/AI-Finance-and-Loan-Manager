// dashboardcontroller.js
// This file contains the controller logic for fetching dashboard summary data.
// It queries MongoDB models (Client, Loan, Payment) to aggregate key metrics.

import Client from "../database/models/client.js";
import Loan from "../database/models/loan.js";
import Payment from "../database/models/payment.js";

// Controller function to get dashboard summary
export const getDashboardSummary = async (req, res) => {
  try {
    // Count total clients
    const totalClients = await Client.countDocuments();

    // Aggregate loan data: total loans and total loan amount
    const loans = await Loan.aggregate([
      {
        $group: {
          _id: null,
          totalLoans: { $sum: 1 }, // Count of all loans
          totalLoanAmount: { $sum: "$totalPayment" }, // Sum of total payment amounts
        },
      },
    ]);

    // Aggregate payment data: total collected from completed payments
    const payments = await Payment.aggregate([
      {
        $match: { status: "Completed" }, // Only consider completed payments
      },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: "$paymentAmount" }, // Sum of payment amounts
        },
      },
    ]);

    // Aggregate loan counts by status (e.g., Active, Closed)
    const loanStatusCounts = await Loan.aggregate([
      {
        $group: {
          _id: "$status", // Group by loan status
          count: { $sum: 1 }, // Count loans per status
        },
      },
    ]);

    // Safely extract values from aggregates (handle cases where no data exists)
    const totalLoans = loans[0]?.totalLoans || 0;
    const totalLoanAmount = loans[0]?.totalLoanAmount || 0;
    const totalLoanCollected = payments[0]?.totalCollected || 0;

    // Respond with JSON data
    res.json({
      totalClients,
      totalLoans,
      totalLoanAmount,
      totalLoanCollected,
      loanStatusCounts, // Array of { _id: status, count: number }
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
