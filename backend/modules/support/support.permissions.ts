import type { SupportTicketDepartment } from "./support.model.js";

import {
    ROLE_DEPARTMENTS,
} from "./support.constants.js";

const ALL_SUPPORT_DEPARTMENTS: SupportTicketDepartment[] = [
    "general",
    "call_center",
    "it",
    "payments",
    "orders",
    "logistics",
    "moderation",
    "account_security",
];

export function getAllowedDepartments(
    role: string,
): SupportTicketDepartment[] {
    if (role === "admin") {
        return [...ALL_SUPPORT_DEPARTMENTS];
    }

    if (role === "support_manager") {
        return [...ALL_SUPPORT_DEPARTMENTS];
    }

    if (
        role === "support_agent"
    ) {
        return ["call_center"];
    }

    if (
        role === "it_agent"
    ) {
        return ["it"];
    }

    if (
        role === "finance_agent"
    ) {
        return ["payments"];
    }

    if (
        role === "logistics_agent"
    ) {
        return ["logistics"];
    }

    if (
        role === "moderator"
    ) {
        return ["moderation"];
    }

    return [];
}

export function isSupportStaff(
    role: string,
): boolean {
    return [
        "admin",
        "support_agent",
        "support_manager",
        "it_agent",
        "finance_agent",
        "logistics_agent",
        "moderator",
    ].includes(role);
}