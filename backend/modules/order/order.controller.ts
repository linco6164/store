import { Request, Response } from "express";
import * as orderService from "./order.service.js";

interface AuthRequest extends Request {
  userId?: string;
}

export async function getMyOrders(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Nu ești autentificat.",
      });
    }

    const orders = await orderService.getBuyerOrders(req.userId);

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error("❌ getMyOrders:", error);

    return res.status(400).json({
      success: false,
      message: error?.message || "Nu s-au putut încărca comenzile.",
    });
  }
}

export async function getMySellingOrders(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Nu ești autentificat.",
      });
    }

    const orders = await orderService.getSellerOrders(req.userId);

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error("❌ getMySellingOrders:", error);

    return res.status(400).json({
      success: false,
      message: error?.message || "Nu s-au putut încărca comenzile.",
    });
  }
}

export async function getCompletedOrders(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Nu ești autentificat.",
      });
    }

    const orders = await orderService.getCompletedBuyerOrders(req.userId);

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error("❌ getCompletedOrders:", error);

    return res.status(400).json({
      success: false,
      message: error?.message || "Nu s-au putut încărca comenzile finalizate.",
    });
  }
}

export async function getOrder(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Nu ești autentificat.",
      });
    }

    const orderId = req.params.id as string;

    const order = await orderService.getOrderById(orderId, req.userId);

    return res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error("❌ getOrder:", error);

    return res.status(400).json({
      success: false,
      message: error?.message || "Nu s-a putut încărca comanda.",
    });
  }
}

export async function confirmOrderReceived(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Nu ești autentificat.",
      });
    }

    const orderId = String(req.params.id ?? "").trim();

    const order = await orderService.completeOrder(
      orderId,
      "buyer_confirmed",
      req.userId,
    );

    return res.json({
      success: true,
      message: "Comanda a fost finalizată.",
      data: order,
    });
  } catch (error: any) {
    console.error("❌ confirmOrderReceived:", error);

    const message = error?.message ?? "Comanda nu a putut fi finalizată.";

    if (message === "ORDER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Comanda nu există.",
      });
    }

    if (message === "ORDER_NOT_OWNED_BY_BUYER") {
      return res.status(403).json({
        success: false,
        message: "Doar cumpărătorul poate confirma această comandă.",
      });
    }

    if (message === "ORDER_NOT_DELIVERED") {
      return res.status(409).json({
        success: false,
        message: "Comanda nu este încă marcată ca livrată.",
      });
    }

    if (message === "SALE_TRANSACTION_NOT_RELEASABLE") {
      return res.status(409).json({
        success: false,
        message: "Fondurile acestei vânzări nu mai pot fi eliberate.",
      });
    }

    if (message === "SALE_TRANSACTION_NOT_FOUND") {
      return res.status(409).json({
        success: false,
        message: "Tranzacția vânzătorului nu a fost găsită.",
      });
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function reportIssue(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Nu ești autentificat.",
      });
    }

    const orderId = String(req.params.id ?? "").trim();

    const { reason, details } = req.body ?? {};

    const order = await orderService.reportOrderIssue(
      orderId,
      req.userId,
      reason,
      details,
    );

    return res.json({
      success: true,
      message:
        "Problema a fost raportată. Finalizarea comenzii a fost suspendată.",
      data: order,
    });
  } catch (error: any) {
    console.error("❌ reportIssue:", error);

    const message = error?.message ?? "Problema nu a putut fi raportată.";

    if (message === "ORDER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Comanda nu există.",
      });
    }

    if (message === "ORDER_NOT_OWNED_BY_BUYER") {
      return res.status(403).json({
        success: false,
        message: "Doar cumpărătorul poate raporta o problemă.",
      });
    }

    if (message === "ORDER_NOT_DELIVERED") {
      return res.status(409).json({
        success: false,
        message: "Poți raporta o problemă doar după livrarea comenzii.",
      });
    }

    if (message === "ORDER_ISSUE_ALREADY_REPORTED") {
      return res.status(409).json({
        success: false,
        message: "Există deja o problemă deschisă pentru această comandă.",
      });
    }

    if (message === "ORDER_ALREADY_COMPLETED") {
      return res.status(409).json({
        success: false,
        message: "Comanda este deja finalizată.",
      });
    }

    if (message === "INVALID_ISSUE_REASON") {
      return res.status(400).json({
        success: false,
        message: "Motivul problemei este invalid.",
      });
    }

    if (message === "ISSUE_DETAILS_REQUIRED") {
      return res.status(400).json({
        success: false,
        message: "Descrie problema întâmpinată.",
      });
    }

    if (message === "ISSUE_DETAILS_TOO_LONG") {
      return res.status(400).json({
        success: false,
        message: "Descrierea problemei este prea lungă.",
      });
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function resolveIssueSellerRelease(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Nu ești autentificat.",
      });
    }

    const orderId = String(req.params.id ?? "").trim();

    const note = typeof req.body?.note === "string" ? req.body.note : undefined;

    const order = await orderService.resolveOrderIssueSellerRelease(
      orderId,
      req.userId,
      note,
    );

    return res.json({
      success: true,
      message:
        "Disputa a fost soluționată în favoarea vânzătorului. Banii au fost eliberați.",
      data: order,
    });
  } catch (error: any) {
    console.error("❌ resolveIssueSellerRelease:", error);

    const message = error?.message ?? "Disputa nu a putut fi soluționată.";

    if (message === "ORDER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Comanda nu există.",
      });
    }

    if (message === "ORDER_HAS_NO_OPEN_ISSUE") {
      return res.status(409).json({
        success: false,
        message: "Comanda nu are o problemă deschisă.",
      });
    }

    if (message === "ORDER_ISSUE_ALREADY_RESOLVED") {
      return res.status(409).json({
        success: false,
        message: "Problema acestei comenzi a fost deja soluționată.",
      });
    }

    if (message === "SALE_TRANSACTION_NOT_FOUND") {
      return res.status(409).json({
        success: false,
        message: "Tranzacția vânzătorului nu a fost găsită.",
      });
    }

    if (message === "SALE_TRANSACTION_NOT_RELEASABLE") {
      return res.status(409).json({
        success: false,
        message: "Tranzacția nu poate fi eliberată.",
      });
    }

    if (message === "INSUFFICIENT_PENDING_BALANCE") {
      return res.status(409).json({
        success: false,
        message: "Soldul blocat al vânzătorului este insuficient.",
      });
    }

    if (message === "ISSUE_RESOLUTION_NOTE_TOO_LONG") {
      return res.status(400).json({
        success: false,
        message: "Nota de soluționare este prea lungă.",
      });
    }

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function resolveIssueBuyerRefund(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Nu ești autentificat.",
      });
    }

    const orderId = String(req.params.id ?? "").trim();

    const note = typeof req.body?.note === "string" ? req.body.note : undefined;

    const order = await orderService.resolveOrderIssueBuyerRefund(
      orderId,
      req.userId,
      note,
    );

    if (!order) {
      return res.status(500).json({
        success: false,
        message: "Comanda nu a putut fi actualizată.",
      });
    }

    // ======================================================
    // WALLET REFUND COMPLETED
    // ======================================================

    if (order.status === "refunded") {
      return res.json({
        success: true,

        message:
          "Rambursarea a fost finalizată. Suma a fost returnată cumpărătorului.",

        refundStatus: "completed",

        data: order,
      });
    }

    // ======================================================
    // NETOPIA REFUND PENDING
    // ======================================================

    if (order.status === "refund_pending") {
      return res.json({
        success: true,

        message:
          "Disputa a fost soluționată în favoarea cumpărătorului. Rambursarea este în așteptarea confirmării procesatorului de plată.",

        refundStatus: "pending",

        data: order,
      });
    }

    // ======================================================
    // UNEXPECTED STATE
    // ======================================================

    return res.status(409).json({
      success: false,

      message:
        "Comanda a ajuns într-o stare neașteptată după soluționarea disputei.",

      data: order,
    });
  } catch (error: any) {
    console.error("❌ resolveIssueBuyerRefund:", error);

    const message = error?.message ?? "Disputa nu a putut fi soluționată.";

    switch (message) {
      case "ORDER_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "Comanda nu există.",
        });

      case "INVALID_RESOLVER":
        return res.status(400).json({
          success: false,
          message: "Utilizatorul care soluționează disputa este invalid.",
        });

      case "ORDER_HAS_NO_OPEN_ISSUE":
        return res.status(409).json({
          success: false,
          message: "Comanda nu are o problemă deschisă.",
        });

      case "ORDER_ISSUE_ALREADY_RESOLVED":
        return res.status(409).json({
          success: false,
          message: "Problema acestei comenzi a fost deja soluționată.",
        });

      case "PAYMENT_NOT_REFUNDABLE":
        return res.status(409).json({
          success: false,
          message: "Plata NETOPIA nu poate fi rambursată.",
        });

      case "PAYMENT_SOURCE_NOT_FOUND":
        return res.status(409).json({
          success: false,
          message: "Nu a fost găsită sursa plății pentru această comandă.",
        });

      case "WALLET_PURCHASE_NOT_REFUNDABLE":
        return res.status(409).json({
          success: false,
          message: "Plata făcută din sold nu poate fi rambursată.",
        });

      case "SALE_TRANSACTION_NOT_FOUND":
        return res.status(409).json({
          success: false,
          message: "Tranzacția vânzătorului nu a fost găsită.",
        });

      case "SALE_TRANSACTION_NOT_REFUNDABLE":
        return res.status(409).json({
          success: false,
          message: "Fondurile vânzătorului nu mai pot fi rambursate.",
        });

      case "INVALID_REFUND_AMOUNT":
        return res.status(409).json({
          success: false,
          message: "Suma de rambursat este invalidă.",
        });

      case "INVALID_SELLER_AMOUNT":
        return res.status(409).json({
          success: false,
          message: "Suma blocată pentru vânzător este invalidă.",
        });

      case "INSUFFICIENT_PENDING_BALANCE":
        return res.status(409).json({
          success: false,
          message: "Soldul în așteptare al vânzătorului este insuficient.",
        });

      case "BUYER_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "Cumpărătorul nu a fost găsit.",
        });

      case "ISSUE_RESOLUTION_NOTE_TOO_LONG":
        return res.status(400).json({
          success: false,
          message: "Nota de soluționare este prea lungă.",
        });

      default:
        return res.status(500).json({
          success: false,
          message: "Disputa nu a putut fi soluționată.",
        });
    }
  }
}
