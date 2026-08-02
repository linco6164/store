"use client";

import { Bell } from "lucide-react";
import HeaderIconButton from "./HeaderIconButton";

interface Props {
    count?: number;
    active?: boolean;
    onClick?: () => void;
}

export default function NotificationsButton({
    count,
    active,
    onClick,
}: Props) {
    return (
        <HeaderIconButton
            icon={<Bell size={21} />}
            tooltip="Notificări"
            count={count}
            active={active}
            onClick={onClick}
        />
    );
}