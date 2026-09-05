"use client";

import { MessageCircle } from "lucide-react";
import HeaderIconButton from "./HeaderIconButton";

interface Props {
    count?: number;
    active?: boolean;
    onClick?: () => void;
}

export default function MessagesButton({
    count,
    active,
    onClick,
}: Props) {
    return (
        <HeaderIconButton
            icon={<MessageCircle size={21} />}
            tooltip="Mesaje"
            count={count}
            active={active}
            onClick={onClick}
        />
    );
}