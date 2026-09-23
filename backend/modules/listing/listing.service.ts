import { ListingDocument, ListingModel } from "./listing.model.js";
import { PromotionModel } from "../promotion/promotion.model.js";
import { categories } from "./category.data.js";

export class ListingService {
  async create(data: Partial<ListingDocument>) {
    const listing = await ListingModel.create(data);

    return listing;
  }

  async findAll() {
    const now = new Date();

    // Luăm promovările active și neexpirate.
    const activePromotions = await PromotionModel.find({
      status: "active",
      expiresAt: {
        $gt: now,
      },
    })
      .sort({
        createdAt: -1,
      })
      .select("listing");

    const promotedIds = activePromotions.map((promotion) => promotion.listing);

    // Anunțurile promovate apar primele.
    const promotedListings =
      promotedIds.length > 0
        ? await ListingModel.find({
            _id: {
              $in: promotedIds,
            },
            status: "active",
          })
            .populate("seller", "username avatar verified rating")
            .sort({
              createdAt: -1,
            })
        : [];

    // Restul anunțurilor.
    const normalListings = await ListingModel.find({
      status: "active",
      ...(promotedIds.length > 0
        ? {
            _id: {
              $nin: promotedIds,
            },
          }
        : {}),
    })
      .populate("seller", "username avatar verified rating")
      .sort({
        createdAt: -1,
      });

    return [...promotedListings, ...normalListings];
  }

  async findById(id: string) {
    return ListingModel.findById(id).populate(
      "seller",
      "username avatar verified rating",
    );
  }

  async update(id: string, data: Partial<ListingDocument>) {
    return ListingModel.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async delete(id: string) {
    return ListingModel.findByIdAndDelete(id);
  }

  async incrementViews(id: string) {
    return ListingModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          views: 1,
        },
      },
      {
        new: true,
      },
    );
  }

  async updateStatus(id: string, status: ListingDocument["status"]) {
    return ListingModel.findByIdAndUpdate(
      id,
      {
        status,
      },
      {
        new: true,
      },
    );
  }

  async search(filters: {
    search?: string;
    category?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
  }) {
    const query: Record<string, any> = {
      status: "active",
    };

    if (filters.search) {
      const search = filters.search.trim();

      if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const regex = new RegExp(escapedSearch, "i");

        query.$or = [
          { title: regex },
          { description: regex },
          { brand: regex },
          { city: regex },
          { category: regex },
        ];
      }
    }

    if (filters.category) {
      const escapedCategory = filters.category.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );

      query.category = new RegExp(`^${escapedCategory}$`, "i");
    }

    if (filters.city) {
      query.city = filters.city;
    }

    if (filters.condition) {
      query.condition = filters.condition;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};

      if (filters.minPrice !== undefined) {
        query.price.$gte = filters.minPrice;
      }

      if (filters.maxPrice !== undefined) {
        query.price.$lte = filters.maxPrice;
      }
    }

    // Întâi găsim rezultatele care respectă filtrele.
    const matchingListings = await ListingModel.find(query)
      .populate("seller", "username avatar verified rating")
      .sort({
        createdAt: -1,
      });

    // Verificăm promovările active.
    const now = new Date();

    const activePromotions = await PromotionModel.find({
      status: "active",
      expiresAt: {
        $gt: now,
      },
      listing: {
        $in: matchingListings.map((listing) => listing._id),
      },
    })
      .sort({
        createdAt: -1,
      })
      .select("listing");

    const promotedIds = new Set(
      activePromotions.map((promotion) => promotion.listing.toString()),
    );

    // Promovatele sunt puse primele.
    const promotedListings = matchingListings.filter((listing) =>
      promotedIds.has(listing._id.toString()),
    );

    // Restul rămân în ordinea normală.
    const normalListings = matchingListings.filter(
      (listing) => !promotedIds.has(listing._id.toString()),
    );

    return [...promotedListings, ...normalListings];
  }

  async findSimilar(id: string, category: string) {
    return ListingModel.find({
      _id: { $ne: id },
      category,
      status: "active",
    })
      .populate("seller", "username avatar")
      .limit(8)
      .sort({
        createdAt: -1,
      });
  }

  async getCategories() {
    return ListingModel.distinct("category");
  }

  async getCategory(categoryId: string) {
    return categories.find((category) => category.id === categoryId);
  }

  async getMyListings(userId: string) {
    return ListingModel.find({
      seller: userId,
    })
      .sort({
        createdAt: -1,
      })
      .populate("seller", "username avatar");
  }
}

export const listingService = new ListingService();
