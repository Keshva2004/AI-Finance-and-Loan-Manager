// controllers/contactController.js
import nodemailer from "nodemailer";

// Create Nodemailer transporter (using env vars)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Send Email (handles contact form submissions)
export const sendEmail = async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Email options with your specified structure
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: "keshva2004@gmail.com", // Your email to receive the message
      subject: "📩 New Contact Message from Your Website", // Updated subject
      text: `
Dear Admin,

You have received a new message through your website’s contact form. Please find the details below:

Name: ${name}
Email: ${email}

Message:

“${message}.”

Thank you for using our contact form.
Best regards,
AI Finance and Loan Management
      `,
      html: `
        <p>Dear Admin,</p>
        <p>You have received a new message through your website’s contact form. Please find the details below:</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>“${message}.”</p>
        <p>Thank you for using our contact form.</p>
        <p>Best regards,<br>AI Finance and Loan Management</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email. Please try again." });
  }
};
