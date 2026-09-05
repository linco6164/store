import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error);
  } else {
    console.log("✅ SMTP connected successfully");
  }
});

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  const info = await transporter.sendMail({
    from: `"SellingApp" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  console.log("📧 Email sent successfully");
  console.log("📨 Message ID:", info.messageId);
  console.log("📬 Sent to:", to);
}