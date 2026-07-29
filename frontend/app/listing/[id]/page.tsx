import { notFound } from "next/navigation";

import Gallery from "../../components/ListingDetails/Gallery";
import ProductInfo from "../../components/ListingDetails/ProductInfo";
import Description from "../../components/ListingDetails/Description";
import SellerCard from "../../components/ListingDetails/SellerCard";
import ShippingCard from "../../components/ListingDetails/ShippingCard";
import Actions from "../../components/ListingDetails/Actions";
import ReportButton from "../../components/ListingDetails/ReportButton";
import SimilarListings from "../../components/ListingDetails/SimilarListings";

import { listingService } from "../../services/listing.service";

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
            <main className="mx-auto max-w-7xl px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Gallery listing={listing} />

                        <ProductInfo listing={listing} />

                        <Description listing={listing} />

                        <SimilarListings
                            listings={listings}
                            currentListingId={listing._id}
                        />
                    </div>

                    <aside className="space-y-6">
                        <Actions listing={listing} />

                        <SellerCard listing={listing} />

                        <ShippingCard />

                        <ReportButton listing={listing} />
                    </aside>
                </div>
            </main>
        );
    } catch {
        notFound();
    }
}