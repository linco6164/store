import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY nu este configurat.");
  }

  const from = process.env.RESEND_FROM_EMAIL;

  if (!from) {
    throw new Error("RESEND_FROM_EMAIL nu este configurat.");
  }

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject,
    html,
  });

  if (error) {
    console.error("❌ Resend email error:", error);
    throw new Error(error.message);
  }

  console.log("📧 Email sent successfully");
  console.log("📨 Resend ID:", data?.id);
  console.log("📬 Sent to:", to);

  return data;
}