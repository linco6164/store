import { Router, Request, Response, NextFunction } from "express";

import supportAuth from "../../middleware/supportAuth.js";
import auth from "../../middleware/auth.js";

import User from "../../models/Users.js";
import { supportController } from "./support.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| ADMIN SUPPORT AUTH
|--------------------------------------------------------------------------
| Folosim auth.ts pentru JWT, apoi verificăm explicit rolul de admin.
| Nu folosim supportAuth aici deoarece acesta permite accesul și userilor banați.
|--------------------------------------------------------------------------
*/

async function supportAdminOnly(
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(req.userId).select(
      "_id role",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden.",
      });
    }

    next();
  } catch (error) {
    console.error(
      "SUPPORT ADMIN AUTH ERROR:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Eroare la verificarea permisiunilor.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| USER SUPPORT
|--------------------------------------------------------------------------
| supportAuth permite accesul și utilizatorilor banați.
| Este necesar pentru cazul în care un cont blocat contactează suportul.
|--------------------------------------------------------------------------
*/

router.post(
  "/tickets",
  supportAuth,
  supportController.createTicket,
);

router.get(
  "/tickets",
  supportAuth,
  supportController.getTickets,
);

router.get(
  "/tickets/:id",
  supportAuth,
  supportController.getTicket,
);

router.post(
  "/tickets/:id/messages",
  supportAuth,
  supportController.addMessage,
);

router.patch(
  "/tickets/:id/close",
  supportAuth,
  supportController.closeTicket,
);

/*
|--------------------------------------------------------------------------
| ADMIN SUPPORT
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/tickets",
  auth,
  supportAdminOnly,
  supportController.getAdminTickets,
);

router.get(
  "/admin/tickets/:id",
  auth,
  supportAdminOnly,
  supportController.getAdminTicket,
);

router.post(
  "/admin/tickets/:id/messages",
  auth,
  supportAdminOnly,
  supportController.addAdminMessage,
);

router.patch(
  "/admin/tickets/:id/status",
  auth,
  supportAdminOnly,
  supportController.updateAdminTicketStatus,
);

export default router;