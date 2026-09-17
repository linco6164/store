import type { Server, Socket } from "socket.io";

import jwt from "jsonwebtoken";

import User from "../models/Users.js";

import { ROLE_DEPARTMENTS } from "../modules/support/support.constants.js";

import type { SupportTicketDepartment } from "../modules/support/support.model.js";

interface SupportSocketUser {
  id: string;
  role: string;
  department: string | null;
}

function getToken(socket: Socket): string | null {
  const authToken = socket.handshake.auth?.token;

  if (typeof authToken === "string" && authToken.length > 0) {
    return authToken;
  }

  const header = socket.handshake.headers.authorization;

  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.substring(7);
  }

  return null;
}

async function authenticateSupportSocket(
  socket: Socket,
): Promise<SupportSocketUser | null> {
  try {
    const token = getToken(socket);

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    const user = await User.findById(decoded.id).select(
      "_id role department banned",
    );

    if (!user) {
      return null;
    }

    /*
     * Utilizatorii normali nu intră în
     * rooms interne Support.
     */
    if (user.role === "user") {
      return null;
    }

    const allowedRoles = [
      "admin",
      "support_agent",
      "support_manager",
      "it_agent",
      "finance_agent",
      "logistics_agent",
      "moderator",
    ];

    if (!allowedRoles.includes(user.role)) {
      return null;
    }

    /*
     * Un cont staff blocat nu trebuie să
     * primească evenimente interne.
     */
    if (user.banned) {
      return null;
    }

    return {
      id: user._id.toString(),
      role: user.role,
      department: user.department ?? null,
    };
  } catch (error) {
    console.error("SUPPORT SOCKET AUTH ERROR:", error);

    return null;
  }
}

function joinStaffRooms(socket: Socket, user: SupportSocketUser) {
  /*
   * Room general pentru tot staff-ul Support.
   */
  socket.join("support:staff");

  /*
   * Admin poate primi evenimente din
   * toate departamentele.
   */
  if (user.role === "admin") {
    socket.join("support:all");

    const departments: SupportTicketDepartment[] = [
      "general",
      "call_center",
      "it",
      "payments",
      "orders",
      "logistics",
      "moderation",
      "account_security",
    ];

    for (const department of departments) {
      socket.join(`support:${department}`);
    }

    return;
  }

  /*
   * Stabilim departamentele accesibile
   * din rol.
   */
  const departments =
    ROLE_DEPARTMENTS[user.role as keyof typeof ROLE_DEPARTMENTS];

  if (!departments) {
    return;
  }

  for (const department of departments) {
    socket.join(`support:${department}`);
  }
}

export default function registerSupportSocket(io: Server) {
  io.on("connection", async (socket) => {
    const user = await authenticateSupportSocket(socket);

    /*
     * Socket normal / user.
     * Nu îl conectăm la Support intern.
     */
    if (!user) {
      return;
    }

    socket.data.supportUser = user;

    joinStaffRooms(socket, user);

    console.log(
      `[SUPPORT SOCKET] ${user.id} connected | role=${user.role} | department=${user.department}`,
    );

    /*
     * Clientul poate cere să intre explicit
     * într-un room de department.
     *
     * Backend-ul verifică accesul.
     */
    socket.on(
      "support:join-department",
      (
        department: SupportTicketDepartment,
        callback?: (response: { success: boolean; message?: string }) => void,
      ) => {
        try {
          if (!department || typeof department !== "string") {
            callback?.({
              success: false,
              message: "Departament invalid.",
            });

            return;
          }

          if (user.role === "admin") {
            socket.join(`support:${department}`);

            callback?.({
              success: true,
            });

            return;
          }

          const allowed: SupportTicketDepartment[] =
            user.role === "support_manager"
              ? [
                  "general",
                  "call_center",
                  "it",
                  "payments",
                  "orders",
                  "logistics",
                  "moderation",
                  "account_security",
                ]
              : user.role === "support_agent"
                ? ["call_center"]
                : user.role === "it_agent"
                  ? ["it"]
                  : user.role === "finance_agent"
                    ? ["payments"]
                    : user.role === "logistics_agent"
                      ? ["logistics"]
                      : user.role === "moderator"
                        ? ["moderation"]
                        : [];

          if (!allowed.includes(department)) {
            callback?.({
              success: false,
              message: "Nu ai acces la acest departament.",
            });

            return;
          }

          socket.join(`support:${department}`);

          callback?.({
            success: true,
          });
        } catch (error) {
          console.error("SUPPORT JOIN DEPARTMENT ERROR:", error);

          callback?.({
            success: false,
            message: "Nu s-a putut accesa departamentul.",
          });
        }
      },
    );

    socket.on("disconnect", (reason) => {
      console.log(`[SUPPORT SOCKET] ${user.id} disconnected | ${reason}`);
    });
  });
}
