import crypto from "crypto";
import UserSession from "./session.model.js";

interface CreateSessionOptions {
  userId: string;
  deviceName?: string;
  platform?: string;
  browser?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function createSession(
  options: CreateSessionOptions,
) {
  const sessionId = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  );

  const session = await UserSession.create({
    user: options.userId,
    sessionId,

    deviceName:
      options.deviceName ||
      "Dispozitiv necunoscut",

    platform:
      options.platform ||
      "unknown",

    browser:
      options.browser ||
      "",

    ipAddress:
      options.ipAddress ||
      "",

    userAgent:
      options.userAgent ||
      "",

    lastActiveAt: new Date(),

    expiresAt,
  });

  return session;
}

export async function getUserSessions(
  userId: string,
) {
  return UserSession.find({
    user: userId,
    expiresAt: {
      $gt: new Date(),
    },
  })
    .sort({
      lastActiveAt: -1,
    })
    .lean();
}

export async function deleteSession(
  userId: string,
  sessionId: string,
) {
  return UserSession.findOneAndDelete({
    user: userId,
    sessionId,
  });
}

export async function deleteCurrentSession(
  userId: string,
  sessionId: string,
) {
  return UserSession.findOneAndDelete({
    user: userId,
    sessionId,
  });
}

export async function deleteOtherSessions(
  userId: string,
  currentSessionId: string,
) {
  return UserSession.deleteMany({
    user: userId,
    sessionId: {
      $ne: currentSessionId,
    },
  });
}

export async function updateLastActive(
  sessionId: string,
) {
  await UserSession.updateOne(
    {
      sessionId,
    },
    {
      $set: {
        lastActiveAt: new Date(),
      },
    },
  );
}