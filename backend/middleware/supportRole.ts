import { Response, NextFunction } from "express";

import User from "../models/Users.js";

import type { AuthRequest } from "./auth.js";

export default function supportRole(
  allowedDepartments: string[] = [],
) {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const user = await User.findById(req.userId)
        .select("_id role department banned");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found.",
        });
      }

      /*
       * Administratorul are acces complet.
       */
      if (user.role === "admin") {
        return next();
      }

      /*
       * Doar staff-ul Support poate intra
       * în sistemul intern de ticketing.
       */
      const supportRoles = [
        "support_agent",
        "support_manager",
        "it_agent",
        "finance_agent",
        "logistics_agent",
        "moderator",
      ];

      if (!supportRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Nu ai permisiunea de a accesa Support.",
        });
      }

      /*
       * Dacă ruta cere un departament specific,
       * verificăm departamentul agentului.
       */
      if (
        allowedDepartments.length > 0 &&
        !allowedDepartments.includes(
          user.department,
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Nu ai acces la acest departament.",
        });
      }

      next();
    } catch (error) {
      console.error(
        "SUPPORT ROLE ERROR:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Eroare la verificarea permisiunilor.",
      });
    }
  };
}