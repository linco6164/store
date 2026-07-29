import {
    ListingDocument,
    ListingModel,
} from "./listing.model.js";

export class ListingService {
    async create(
        data: Partial<ListingDocument>
    ) {
        const listing = await ListingModel.create(data);

        return listing;
    }

    async findAll() {
        return ListingModel.find()
            .populate("seller", "username avatar")
            .sort({
                createdAt: -1,
            });
    }

    async findById(id: string) {
        return ListingModel.findById(id).populate(
            "seller",
            "username avatar"
        );
    }

    async update(
        id: string,
        data: Partial<ListingDocument>
    ) {
        return ListingModel.findByIdAndUpdate(
            id,
            data,
            {
                new: true,
            }
        );
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
            }
        );
    }

    async toggleSold(
        id: string,
        sold: boolean
    ) {
        return ListingModel.findByIdAndUpdate(
            id,
            {
                sold,
            },
            {
                new: true,
            }
        );
    }

    async search(
        filters: {
            category?: string;
            city?: string;
            minPrice?: number;
            maxPrice?: number;
            condition?: string;
        }
    ) {
        const query: Record<string, any> = {};

        if (filters.category) {
            query.category = filters.category;
        }

        if (filters.city) {
            query.city = filters.city;
        }

        if (filters.condition) {
            query.condition = filters.condition;
        }

        if (
            filters.minPrice !== undefined ||
            filters.maxPrice !== undefined
        ) {
            query.price = {};

            if (filters.minPrice !== undefined) {
                query.price.$gte = filters.minPrice;
            }

            if (filters.maxPrice !== undefined) {
                query.price.$lte = filters.maxPrice;
            }
        }

        return ListingModel.find(query)
            .populate("seller", "username avatar")
            .sort({
                createdAt: -1,
            });
    }
}

export const listingService =
    new ListingService();