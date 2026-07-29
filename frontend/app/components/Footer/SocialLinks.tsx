import Link from "next/link";
import {
    FaFacebook,
    FaInstagram,
    FaDiscord,
    FaTiktok,
} from "react-icons/fa6";

export default function SocialLinks() {
    return (
        <div className="flex items-center gap-4">
            <Link href="#">
                <FaInstagram
                    size={22}
                    className="text-gray-500 transition hover:text-pink-500"
                />
            </Link>

            <Link href="#">
                <FaFacebook
                    size={22}
                    className="text-gray-500 transition hover:text-blue-600"
                />
            </Link>

            <Link href="#">
                <FaTiktok
                    size={22}
                    className="text-gray-500 transition hover:text-black"
                />
            </Link>

            <Link href="#">
                <FaDiscord
                    size={22}
                    className="text-gray-500 transition hover:text-indigo-500"
                />
            </Link>
        </div>
    );
}