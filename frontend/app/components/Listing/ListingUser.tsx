interface Props {
    username: string;
    city: string;
}

export default function ListingUser({
    username,
    city,
}: Props) {
    return (
        <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
            <span>{username}</span>
            <span>{city}</span>
        </div>
    );
}