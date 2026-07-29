interface Props {
    condition: string;
}

const labels = {
    new: "Nou",
    like_new: "Ca nou",
    good: "Foarte bun",
    fair: "Bun",
};

export default function ListingBadge({ condition }: Props) {
    return (
        <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow">
            {labels[condition as keyof typeof labels]}
        </span>
    );
}