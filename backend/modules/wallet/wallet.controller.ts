import { Response } from "express";

import { AuthRequest } from "../../middleware/auth.js";

import { walletService } from "./wallet.service.js";

class WalletController {
  async getWallet(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const wallet = await walletService.getWallet(req.userId);

      return res.json({
        success: true,
        data: wallet,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to load wallet.",
      });
    }
  }

  async getTransactions(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await walletService.getTransactions(
        req.userId,
        Number(req.query.limit),
        Number(req.query.skip),
      );

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to load transactions.",
      });
    }
  }

  async purchase(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { listingId } = req.body ?? {};

      if (typeof listingId !== "string" || !listingId) {
        return res.status(400).json({
          success: false,
          message: "listingId este obligatoriu.",
        });
      }

      const result = await walletService.purchase(req.userId, listingId);

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        switch (error.message) {
          case "LISTING_NOT_AVAILABLE":
            return res.status(404).json({
              success: false,
              message: "Produsul nu mai este disponibil.",
            });

          case "CANNOT_BUY_OWN_LISTING":
            return res.status(400).json({
              success: false,
              message: "Nu poți cumpăra propriul produs.",
            });

          case "INSUFFICIENT_BALANCE":
            return res.status(400).json({
              success: false,
              message: "Sold insuficient.",
            });

          case "INVALID_LISTING_PRICE":
            return res.status(400).json({
              success: false,
              message: "Prețul produsului este invalid.",
            });

          case "LISTING_ALREADY_SOLD":
            return res.status(409).json({
              success: false,
              message: "Produsul tocmai a fost cumpărat de alt utilizator.",
            });
        }
      }

      return res.status(500).json({
        success: false,
        message: "Cumpărarea produsului a eșuat.",
      });
    }
  }

  async withdraw(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { amount, iban, accountName } = req.body ?? {};

      const result = await walletService.withdraw(
        req.userId,
        Number(amount),
        String(iban ?? ""),
        String(accountName ?? ""),
      );

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        switch (error.message) {
          case "INVALID_AMOUNT":
            return res.status(400).json({
              success: false,
              message: "Suma este invalidă.",
            });

          case "MIN_WITHDRAWAL":
            return res.status(400).json({
              success: false,
              message: "Suma minimă pentru retragere este 20 RON.",
            });

          case "INVALID_IBAN":
            return res.status(400).json({
              success: false,
              message: "IBAN invalid.",
            });

          case "INVALID_ACCOUNT_NAME":
            return res.status(400).json({
              success: false,
              message: "Numele titularului este invalid.",
            });

          case "INSUFFICIENT_BALANCE":
            return res.status(400).json({
              success: false,
              message: "Nu ai suficienți bani în sold.",
            });
        }
      }

      return res.status(500).json({
        success: false,
        message: "Retragerea nu a putut fi procesată.",
      });
    }
  }
}

export const walletController = new WalletController();
