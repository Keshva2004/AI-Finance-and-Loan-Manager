import nodemailer from "nodemailer";
import Loan from "../database/models/loan.js"; // Changed to Loan model, as we query loans and populate clients
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString("en-IN") : "N/A";
};

const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString("en-IN")}`;
};

async function sendEmail(client, loans) {
  try {
    // Build loan details for the email
    const loanDetails = loans
      .map(
        (loan) =>
          `- Loan Type: ${loan.loanType}, Amount: ${formatCurrency(
            loan.loanAmount
          )}, Status: ${loan.status}, Monthly EMI: ${formatCurrency(
            loan.monthlyEMI
          )}, Due Date: ${formatDate(loan.endDate)}`
      )
      .join("\n");

    await transporter.sendMail({
      from: `"Finance Team" <${process.env.EMAIL_USER}>`,
      to: client.email,
      subject: `Loan Reminder – Keep Your Payments on Track`,
      text: `
Dear ${client.full_name},

We hope you are doing well. This is a friendly reminder about your active loans with us.

Here are the details of your loans:
${loanDetails}

Please ensure your payments are up to date to avoid any issues. If you have any questions or need assistance, feel free to reach out.

Thank you for choosing our services.

Best regards,
Finance Team
${process.env.EMAIL_USER}
      `,
    });

    console.log(
      `Email successfully sent to ${client.full_name} (${client.email})`
    );
  } catch (err) {
    console.error(
      `Failed to send email to ${client.full_name} (${client.email}):`,
      err.message
    );
    console.error(
      "   (Check your EMAIL_USER and EMAIL_PASS environment variables!)"
    );
  }
}

export async function sendLoanReminders() {
  try {
    // Query all loans and populate borrower details
    const loans = await Loan.find().populate("borrowerId", "full_name email");

    if (loans.length === 0) {
      console.log("No loans found to send reminders for.");
      return { success: true, message: "No loans found." };
    }

    // Group loans by unique borrower (client)
    const clientLoansMap = {};
    loans.forEach((loan) => {
      const clientId = loan.borrowerId._id.toString();
      if (!clientLoansMap[clientId]) {
        clientLoansMap[clientId] = { client: loan.borrowerId, loans: [] };
      }
      clientLoansMap[clientId].loans.push(loan);
    });

    const uniqueClients = Object.values(clientLoansMap);
    console.log(
      `Found ${uniqueClients.length} unique client(s) with loans. Sending emails...`
    );

    let successCount = 0;
    let failureCount = 0;

    for (const { client, loans } of uniqueClients) {
      try {
        await sendEmail(client, loans);
        successCount++;
      } catch (err) {
        failureCount++;
        console.error(`Error sending to ${client.full_name}:`, err.message);
      }
    }

    console.log("Finished sending loan reminders job.");
    return {
      success: true,
      message: `Reminders sent: ${successCount} successful, ${failureCount} failed.`,
    };
  } catch (err) {
    console.error("Error while sending loan reminders:", err.message);
    return { success: false, message: "Error while sending reminders." };
  }
}
