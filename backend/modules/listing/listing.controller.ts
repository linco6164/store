import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.js";

import { upload } from "../../middleware/upload.js";
import { visualSearchService } from "./visual-search.service.js";

import { listingService } from "./listing.service.js";

type ListingParams = {
  id: string;
};

class ListingController {
  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const listing = await listingService.create({
        ...req.body,
        seller: req.userId,
      });

      return res.status(201).json({
        success: true,
        message: "Listing created successfully.",
        data: listing,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to create listing.",
      });
    }
  }

  async findAll(req: Request<ListingParams>, res: Response) {
    try {
      const listings = await listingService.findAll();

      return res.json({
        success: true,
        data: listings,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch listings.",
      });
    }
  }

  async findById(req: Request<ListingParams>, res: Response) {
    try {
      const listing = await listingService.findById(req.params.id);

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: "Listing not found.",
        });
      }

      await listingService.incrementViews(req.params.id);

      return res.json({
        success: true,
        data: listing,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch listing.",
      });
    }
  }

  async update(req: Request<ListingParams>, res: Response) {
    try {
      const listing = await listingService.update(req.params.id, req.body);

      return res.json({
        success: true,
        data: listing,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update listing.",
      });
    }
  }

  async delete(req: Request<ListingParams>, res: Response) {
    try {
      await listingService.delete(req.params.id);

      return res.json({
        success: true,
        message: "Listing deleted.",
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete listing.",
      });
    }
  }

  async search(req: Request<ListingParams>, res: Response) {
    try {
      const listings = await listingService.search({
        search: req.query.search as string,
        category: req.query.category as string,
        city: req.query.city as string,
        condition: req.query.condition as string,

        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,

        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      });

      return res.json({
        success: true,
        data: listings,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Search failed!",
      });
    }
  }

  async updateStatus(req: Request<ListingParams>, res: Response) {
    try {
      const listing = await listingService.updateStatus(
        req.params.id,
        req.body.status,
      );

      return res.json({
        success: true,
        data: listing,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update listing status.",
      });
    }
  }

  async visualSearch(req: Request, res: Response) {
    try {
      const file = req.file as Express.Multer.File;

      console.log("VISUAL SEARCH FILE:", {
        originalname: file?.originalname,
        mimetype: file?.mimetype,
        size: file?.size,
      });

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Nu a fost trimisă nicio imagine.",
        });
      }

      const result = await visualSearchService.searchByImage(
        file.buffer,
        file.mimetype,
      );

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("========== VISUAL SEARCH ERROR ==========");

      console.error(error);

      console.error("=========================================");

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Căutarea vizuală a eșuat.",
      });
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await listingService.getCategories();

      return res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error("Get categories error:", error);

      return res.status(500).json({
        success: false,
        message: "Eroare la încărcarea categoriilor.",
      });
    }
  }

  async getCategory(req: Request, res: Response) {
    try {
      const category = await listingService.getCategory(String(req.params.categoryId));

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }

      return res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error("Get category error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch category.",
      });
    }
  }

  async getMyListings(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Neautorizat",
      });
    }

    const listings = await listingService.getMyListings(
      req.userId,
    );

    return res.json({
      success: true,
      data: listings,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error?.message ??
        "Eroare la încărcarea anunțurilor.",
    });
  }
}
}

export const listingController = new ListingController();
