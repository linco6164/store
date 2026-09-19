import dns from "dns";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Fixes ENETUNREACH on hosts without IPv6
dns.setDefaultResultOrder("ipv4first");

const port = Number(process.env.SMTP_PORT) || 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port,
  secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error);
  } else {
    console.log("✅ SMTP connected successfully");
  }
});

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
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