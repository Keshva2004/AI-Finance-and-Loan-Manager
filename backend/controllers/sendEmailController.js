import Loan from "../database/models/loan.js";
import EmailLog from "../database/models/emailLog.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --------------------- SINGLE SEND ------------------------
export const sendEmail = async (req, res) => {
  try {
    const { clientId, subject, body } = req.body;

    if (!clientId || !subject || !body)
      return res.status(400).json({ error: "Missing fields" });

    const loans = await Loan.find({ borrowerId: clientId }).populate(
      "borrowerId",
      "full_name email"
    );

    if (!loans.length)
      return res.status(404).json({ error: "Client not found" });

    const client = loans[0].borrowerId;

    await transporter.sendMail({
      from: `"Finance Team" <${process.env.EMAIL_USER}>`,
      to: client.email,
      subject,
      html: body,
    });

    await EmailLog.create({
      clientId,
      subject,
      body,
      status: "sent",
    });

    return res.json({ success: true, message: "Email sent" });
  } catch (err) {
    console.error("Send Error:", err.message);
    return res.status(500).json({ error: "Email send failed" });
  }
};

// --------------------- BULK SEND ------------------------
export const bulkSendDue = async (req, res) => {
  try {
    const { template } = req.body;

    if (!template || !template.subject || !template.body)
      return res.status(400).json({ error: "Template missing" });

    // Get all loan borrowers
    const loans = await Loan.find().populate("borrowerId", "full_name email");

    const clientMap = {};

    loans.forEach((loan) => {
      const id = loan.borrowerId._id.toString();
      if (!clientMap[id])
        clientMap[id] = { client: loan.borrowerId, loans: [] };
      clientMap[id].loans.push(loan);
    });

    const clients = Object.values(clientMap);

    let success = 0,
      fail = 0;

    for (const { client } of clients) {
      const personalizedBody = template.body.replaceAll(
        "{CLIENT_NAME}",
        client.full_name
      );

      try {
        await transporter.sendMail({
          from: `"Finance Team" <${process.env.EMAIL_USER}>`,
          to: client.email,
          subject: template.subject,
          html: personalizedBody,
        });

        await EmailLog.create({
          clientId: client._id,
          subject: template.subject,
          body: personalizedBody,
          status: "sent",
        });

        success++;
      } catch (err) {
        fail++;
      }
    }

    return res.json({
      success: true,
      message: `Bulk send complete: ${success} sent, ${fail} failed`,
    });
  } catch (err) {
    console.error("Bulk Error:", err.message);
    return res.status(500).json({ error: "Bulk send failed" });
  }
};
