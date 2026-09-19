import crypto from "crypto";
import bcrypt from "bcrypt";
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

export async function requestEmailChange(
  userId: string,
  newEmail: string,
  currentPassword: string,
) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Utilizatorul nu a fost găsit.");
  }

  if (!currentPassword) {
    throw new Error("Parola actuală este obligatorie.");
  }

  if (!user.password) {
    throw new Error("Contul nu are o parolă setată.");
  }

  const passwordMatches = await bcrypt.compare(currentPassword, user.password);

  if (!passwordMatches) {
    throw new Error("Parola actuală este incorectă.");
  }

  const normalizedEmail = newEmail.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Introdu o adresă de email.");
  }

  if (normalizedEmail === user.email.toLowerCase()) {
    throw new Error("Noua adresă de email este aceeași cu adresa actuală.");
  }

  const existingUser = await User.findOne({
    email: normalizedEmail,
    _id: { $ne: userId },
  });

  if (existingUser) {
    throw new Error("Această adresă de email este deja folosită.");
  }

  const code = crypto.randomInt(100000, 1000000).toString();

  user.emailChangePending = normalizedEmail;
  user.emailChangeCode = code;
  user.emailChangeExpires = new Date(Date.now() + 10 * 60 * 1000);

  await user.save();

  await sendEmail(
    normalizedEmail,
    "Confirmă schimbarea adresei de email - Nexora Store",
    `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
      ">
        <h2>Confirmă noua adresă de email</h2>

        <p>
          Ai solicitat schimbarea adresei de email pentru
          contul tău Nexora Store.
        </p>

        <p>
          Introdu codul de mai jos în aplicație:
        </p>

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

        <p>
          Codul este valabil timp de
          <strong>10 minute</strong>.
        </p>

        <p>
          Dacă nu ai solicitat această schimbare,
          ignoră acest email.
        </p>

        <p>— Nexora Store</p>
      </div>
    `,
  );
}

export async function confirmEmailChange(userId: string, code: string) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Utilizatorul nu a fost găsit.");
  }

  if (
    !user.emailChangePending ||
    !user.emailChangeCode ||
    !user.emailChangeExpires
  ) {
    throw new Error("Nu există o modificare de email în așteptare.");
  }

  if (user.emailChangeExpires.getTime() < Date.now()) {
    user.emailChangePending = null;
    user.emailChangeCode = null;
    user.emailChangeExpires = null;

    await user.save();

    throw new Error("Codul de modificare a emailului a expirat.");
  }

  if (user.emailChangeCode !== code.trim()) {
    throw new Error("Cod de verificare invalid.");
  }

  const newEmail = user.emailChangePending.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: newEmail,
    _id: { $ne: userId },
  });

  if (existingUser) {
    user.emailChangePending = null;
    user.emailChangeCode = null;
    user.emailChangeExpires = null;

    await user.save();

    throw new Error("Această adresă de email este deja folosită.");
  }

  user.email = newEmail;
  user.emailVerified = true;

  user.emailChangePending = null;
  user.emailChangeCode = null;
  user.emailChangeExpires = null;

  await user.save();
}
