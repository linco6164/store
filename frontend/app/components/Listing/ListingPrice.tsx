interface Props {
    price: number;
}

export default function ListingPrice({
    price,
}: Props) {
    return (
        <p className="mt-2 text-lg font-bold">
            {price.toLocaleString("ro-RO")} lei
        </p>
    );
}