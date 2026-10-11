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

    return res.status(400).json({
      success: false,
      message,
    });
  }
}
