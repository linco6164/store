import crypto from "crypto";
import User from "../../../models/Users.js";
import { sendEmail } from "../../../utils/sendEmail.js";

function generateCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function sendEmailVerification(userId: string) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Utilizatorul nu a fost găsit.");
  }

  if (user.emailVerified) {
    throw new Error("Adresa de email este deja verificată.");
  }

  const code = generateCode();

  user.emailVerificationCode = code;
  user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  await sendEmail(
    user.email,
    "Verifică adresa de email - Nexora Store",
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verifică adresa de email</h2>

      <p>Folosește codul de mai jos pentru a verifica adresa de email:</p>

      <div style="
        font-size: 32px;
        font-weight: bold;
        letter-spacing: 8px;
        text-align: center;
        padding: 20px;
        margin: 20px 0;
        background: #f5f5f5;
        border-radius: 12px;
      ">
        ${code}
      </div>

      <p>Codul este valabil timp de <strong>10 minute</strong>.</p>

      <p>
        Dacă nu ai solicitat această verificare, poți ignora acest email.
      </p>

      <p>— Nexora Store</p>
    </div>
  `,
  );
}

export async function verifyEmail(userId: string, code: string) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Utilizatorul nu a fost găsit.");
  }

  if (user.emailVerified) {
    throw new Error("Adresa de email este deja verificată.");
  }

  if (!user.emailVerificationCode || !user.emailVerificationExpires) {
    throw new Error("Nu există un cod de verificare activ.");
  }

  if (user.emailVerificationExpires.getTime() < Date.now()) {
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;

    await user.save();

    throw new Error("Codul de verificare a expirat.");
  }

  if (user.emailVerificationCode !== code.trim()) {
    throw new Error("Cod de verificare invalid.");
  }

  user.emailVerified = true;
  user.emailVerificationCode = null;
  user.emailVerificationExpires = null;

  await user.save();
}
