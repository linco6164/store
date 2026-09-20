import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../../../models/Users.js";
import { sendSms } from "../../../utils/smsLink.js";

const CODE_EXPIRATION_MS = 10 * 60 * 1000;

function generateCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function normalizePhone(phone: string): string {
  let value = String(phone || "").trim();

  value = value.replace(/[\s()-]/g, "");

  if (value.startsWith("0040")) {
    value = "+40" + value.substring(4);
  }

  if (value.startsWith("07")) {
    value = "+40" + value.substring(1);
  }

  if (!value.startsWith("+40")) {
    throw new Error(
      "Numărul de telefon trebuie să fie un număr mobil din România.",
    );
  }

  const mobilePart = value.substring(3);

  if (!/^7\d{8}$/.test(mobilePart)) {
    throw new Error(
      "Numărul de telefon nu este valid. Exemplu: 07XXXXXXXX.",
    );
  }

  return value;
}

async function phoneExists(
  phone: string,
  excludeUserId?: string,
): Promise<boolean> {
  const query: any = {
    phone,
  };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const existingUser = await User.findOne(query).select("_id").lean();

  return Boolean(existingUser);
}

export async function sendPhoneVerification(userId: string) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Utilizatorul nu a fost găsit.");
  }

  if (!user.phone) {
    throw new Error(
      "Nu ai un număr de telefon asociat contului.",
    );
  }

  if (user.phoneVerified === true) {
    throw new Error(
      "Numărul de telefon este deja verificat.",
    );
  }

  const phone = normalizePhone(user.phone);

  const code = generateCode();
  const expires = new Date(Date.now() + CODE_EXPIRATION_MS);

  user.phoneVerificationCode = code;
  user.phoneVerificationExpires = expires;

  await user.save();

  try {
    await sendSms(
      phone,
      `Codul tau Nexora Store este: ${code}. Codul expira in 10 minute.`,
    );
  } catch (error) {
    user.phoneVerificationCode = null;
    user.phoneVerificationExpires = null;

    await user.save();

    throw error;
  }

  return {
    success: true,
    message: "Codul de verificare a fost trimis prin SMS.",
  };
}

export async function verifyPhone(
  userId: string,
  code: string,
) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Utilizatorul nu a fost găsit.");
  }

  if (user.phoneVerified === true) {
    throw new Error(
      "Numărul de telefon este deja verificat.",
    );
  }

  const normalizedCode = String(code || "").trim();

  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new Error(
      "Codul trebuie să conțină exact 6 cifre.",
    );
  }

  if (
    !user.phoneVerificationCode ||
    !user.phoneVerificationExpires
  ) {
    throw new Error(
      "Nu există un cod de verificare activ. Solicită un cod nou.",
    );
  }

  if (
    user.phoneVerificationExpires.getTime() <
    Date.now()
  ) {
    user.phoneVerificationCode = null;
    user.phoneVerificationExpires = null;

    await user.save();

    throw new Error(
      "Codul de verificare a expirat. Solicită un cod nou.",
    );
  }

  if (user.phoneVerificationCode !== normalizedCode) {
    throw new Error("Codul de verificare este incorect.");
  }

  user.phoneVerified = true;
  user.phoneVerificationCode = null;
  user.phoneVerificationExpires = null;

  await user.save();

  return {
    success: true,
    message: "Numărul de telefon a fost verificat.",
  };
}

export async function requestPhoneChange(
  userId: string,
  newPhone: string,
  currentPassword: string,
) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Utilizatorul nu a fost găsit.");
  }

  if (!user.password) {
    throw new Error(
      "Contul nu poate folosi schimbarea parolei prin această metodă.",
    );
  }

  if (!currentPassword) {
    throw new Error("Parola actuală este obligatorie.");
  }

  const passwordMatches = await bcrypt.compare(
    currentPassword,
    user.password,
  );

  if (!passwordMatches) {
    throw new Error("Parola actuală este incorectă.");
  }

  const normalizedPhone = normalizePhone(newPhone);

  const currentPhone = user.phone
    ? normalizePhone(user.phone)
    : null;

  if (currentPhone === normalizedPhone) {
    throw new Error(
      "Noul număr de telefon este identic cu cel actual.",
    );
  }

  const alreadyExists = await phoneExists(
    normalizedPhone,
    userId,
  );

  if (alreadyExists) {
    throw new Error(
      "Acest număr de telefon este deja asociat unui alt cont.",
    );
  }

  const code = generateCode();
  const expires = new Date(Date.now() + CODE_EXPIRATION_MS);

  user.phoneChangePending = normalizedPhone;
  user.phoneChangeCode = code;
  user.phoneChangeExpires = expires;

  await user.save();

  try {
    await sendSms(
      normalizedPhone,
      `Codul pentru schimbarea numarului Nexora Store este: ${code}. Codul expira in 10 minute.`,
    );
  } catch (error) {
    user.phoneChangePending = null;
    user.phoneChangeCode = null;
    user.phoneChangeExpires = null;

    await user.save();

    throw error;
  }

  return {
    success: true,
    message:
      "Codul pentru schimbarea numărului a fost trimis prin SMS.",
  };
}

export async function confirmPhoneChange(
  userId: string,
  code: string,
) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Utilizatorul nu a fost găsit.");
  }

  const normalizedCode = String(code || "").trim();

  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new Error(
      "Codul trebuie să conțină exact 6 cifre.",
    );
  }

  if (
    !user.phoneChangePending ||
    !user.phoneChangeCode ||
    !user.phoneChangeExpires
  ) {
    throw new Error(
      "Nu există o schimbare de număr de telefon în așteptare.",
    );
  }

  if (
    user.phoneChangeExpires.getTime() <
    Date.now()
  ) {
    user.phoneChangePending = null;
    user.phoneChangeCode = null;
    user.phoneChangeExpires = null;

    await user.save();

    throw new Error(
      "Codul de schimbare a numărului a expirat.",
    );
  }

  if (user.phoneChangeCode !== normalizedCode) {
    throw new Error("Codul de verificare este incorect.");
  }

  const newPhone = user.phoneChangePending;

  const alreadyExists = await phoneExists(
    newPhone,
    userId,
  );

  if (alreadyExists) {
    user.phoneChangePending = null;
    user.phoneChangeCode = null;
    user.phoneChangeExpires = null;

    await user.save();

    throw new Error(
      "Acest număr de telefon este deja asociat unui alt cont.",
    );
  }

  user.phone = newPhone;
  user.phoneVerified = true;

  user.phoneVerificationCode = null;
  user.phoneVerificationExpires = null;

  user.phoneChangePending = null;
  user.phoneChangeCode = null;
  user.phoneChangeExpires = null;

  await user.save();

  return {
    success: true,
    message: "Numărul de telefon a fost schimbat și verificat.",
  };
}