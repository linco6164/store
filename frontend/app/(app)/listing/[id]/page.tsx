import { notFound } from "next/navigation";

import {
    ProductGallery,
    ProductHeader,
    ProductTags,
    ProductDescription,
    ProductDetails,
    StickySidebar,
    SimilarListings,
} from "@/app/components/ProductInfo";

import { listingService } from "@/app/services/listing.service";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ListingPage({
    params,
}: PageProps) {
    const { id } = await params;

    try {
        const listing = await listingService.getOne(id);
        const listings = await listingService.getAll();

        return (
            <main className="bg-gray-50">

                <div className="mx-auto max-w-screen-2xl px-6 py-10">

                    <ProductHeader
                        title={listing.title}
                        category={listing.category}
                        condition={listing.condition}
                        city={listing.city}
                        createdAt={listing.createdAt}
                        views={listing.views}
                    />

                    <div className="mt-6">

                        <ProductTags
                            category={listing.category}
                            condition={listing.condition}
                            negotiable={listing.negotiable}
                            shipping={listing.shipping}
                        />

                    </div>

                    <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">

                        {/* LEFT */}

                        <div className="space-y-8">

                            <ProductGallery
                                images={listing.images}
                                title={listing.title}
                            />

                            <ProductDescription
                                description={
                                    listing.description
                                }
                            />

                            <ProductDetails
                                specifications={{
                                    category:
                                        listing.category,
                                    condition:
                                        listing.condition,
                                    brand:
                                        listing.brand,
                                    color:
                                        listing.color,
                                }}
                            />

                        </div>

                        {/* RIGHT */}

                        <StickySidebar
                            listingId={listing._id}
                            price={listing.price}
                            city={listing.city}
                            createdAt={listing.createdAt}
                            favorite={false}
                            seller={{
                                _id:
                                    listing.seller._id,
                                username:
                                    listing.seller.username,
                                avatar:
                                    listing.seller.avatar,
                            }}
                        />

                    </div>

                    <SimilarListings
                        listings={listings.filter(
                            (item) =>
                                item._id !==
                                listing._id
                        )}
                    />

                </div>

            </main>
        );
    } catch {
        notFound();
    }
}