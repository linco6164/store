import User from "../../models/Users.js";
import { ListingModel } from "../listing/listing.model.js";

class ProfileService {
    async getProfile(userId: string) {
        const user = await User.findById(userId)
            .select("-password");

        if (!user) {
            throw new Error("User not found");
        }

        const listings = await ListingModel.find({
            seller: userId,
        })
            .sort({
                createdAt: -1,
            })
            .populate(
                "seller",
                "username avatar"
            );

        const soldListings = listings.filter(
            (listing) =>
                listing.status === "sold"
        );

        return {
            user,

            stats: {
                listings: listings.length,
                sold: soldListings.length,
                favorites: 0,
            },

            listings,
        };
    }

    async getPublicProfile(userId: string) {
        const user = await User.findById(userId)
            .select(
                "username fullName avatar bio city country createdAt"
            );

        if (!user) {
            throw new Error(
                "USER_NOT_FOUND"
            );
        }

        const [listings, sold] =
            await Promise.all([
                ListingModel.find({
                    seller: userId,
                    status: "active",
                })
                    .sort({
                        createdAt: -1,
                    })
                    .populate(
                        "seller",
                        "username avatar"
                    ),

                ListingModel.countDocuments({
                    seller: userId,
                    status: "sold",
                }),
            ]);

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

    async updateProfile(
        userId: string,
        payload: Record<string, unknown>
    ) {
        const allowedFields = [
            "username",
            "fullName",
            "phone",
            "bio",
            "avatar",
            "country",
            "city",
            "county",
            "postalCode",
            "instagram",
            "facebook",
            "website",
        ] as const;

        const updates = Object.fromEntries(
            allowedFields
                .filter(
                    (field) =>
                        typeof payload[field] ===
                        "string"
                )
                .map((field) => [
                    field,
                    payload[field],
                ])
        );

        if (updates.username) {
            const existingUser =
                await User.findOne({
                    username: updates.username,
                    _id: {
                        $ne: userId,
                    },
                });

            if (existingUser) {
                throw new Error(
                    "USERNAME_TAKEN"
                );
            }
        }

        const user =
            await User.findByIdAndUpdate(
                userId,
                {
                    $set: updates,
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!user) {
            throw new Error(
                "USER_NOT_FOUND"
            );
        }

        return this.getProfile(userId);
    }
}

export const profileService =
    new ProfileService();