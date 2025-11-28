const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail", // e.g., 'gmail', 'outlook', 'yahoo'
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
    console.log("\n⚠️  Please configure your email settings in the .env file");
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

// Route to handle form submission
app.post("/send-email", async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate input
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required!",
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format!",
    });
  }

  // Email options - Send TO the user's email (dynamic)
  const mailOptions = {
    from: `"Contact Form" <${process.env.EMAIL_USER}>`, // Your email as sender
    to: email,
    cc: process.env.EMAIL_USER, // Send to the user's email (dynamic from form)
    replyTo: process.env.EMAIL_USER, // Your email for replies
    subject: `Thank you for contacting us: ${subject}`,
    text: `
Hello ${name},

Thank you for contacting us! We have received your message and will get back to you soon.

Your message details:
Subject: ${subject}

Message:
${message}

Best regards,
The Team
        `,
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #667eea;">Thank You for Contacting Us!</h2>
                <p style="font-size: 16px; color: #333;">Hello <strong>${name}</strong>,</p>
                <p style="font-size: 16px; color: #333;">We have received your message and will get back to you as soon as possible.</p>

                <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #667eea; margin-top: 0;">Your Message Details:</h3>
                    <p><strong>Subject:</strong> ${subject}</p>
                </div>

                <div style="background: white; padding: 20px; border-left: 4px solid #667eea; border-radius: 5px;">
                    <h3 style="margin-top: 0;">Message:</h3>
                    <p style="white-space: pre-wrap; color: #555;">${message}</p>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                    <p style="color: #666; font-size: 14px;">Best regards,<br><strong>The Team</strong></p>
                </div>
            </div>
        `,
  };

  try {
    // Send email to the user
    await transporter.sendMail(mailOptions);
    console.log(
      `✅ Email sent to: ${email} (Name: ${name}, Subject: ${subject})`
    );

    res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📧 Contact form available at http://localhost:${PORT}\n`);
});
