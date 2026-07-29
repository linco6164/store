import User from "../../models/Users.js";
import { ListingModel } from "../listing/listing.model.js";

class ProfileService {
    async getProfile(userId: string) {
        const user = await User.findById(userId).select("-password");

        if (!user) {
            throw new Error("User not found");
        }

        const listings = await ListingModel.find({
            seller: userId,
        })
            .sort({
                createdAt: -1,
            })
            .populate("seller", "username avatar");

        const sold = listings.filter(
            (listing) => listing.sold
        ).length;

        return {
            user,
            stats: {
                listings: listings.length,
                sold,
                favorites: 0,
            },
            listings,
        };
    }
}

export const profileService = new ProfileService();