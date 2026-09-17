import type {
  SupportTicketCategory,
  SupportTicketDepartment,
} from "./support.model.js";

/**
 * =========================================================
 * SUPPORT DEPARTMENTS
 * =========================================================
 */

export const SUPPORT_DEPARTMENTS: SupportTicketDepartment[] = [
  "general",
  "call_center",
  "it",
  "payments",
  "orders",
  "logistics",
  "moderation",
  "account_security",
];

/**
 * =========================================================
 * SUPPORT ROLES
 * =========================================================
 */

export const SUPPORT_ROLES = [
  "admin",
  "support_agent",
  "support_manager",
  "it_agent",
  "finance_agent",
  "logistics_agent",
  "moderator",
] as const;

export type SupportRole = (typeof SUPPORT_ROLES)[number];

/**
 * =========================================================
 * CATEGORY → DEPARTMENT
 * =========================================================
 *
 * Departamentul este stabilit de backend
 * în funcție de categoria ticketului.
 */

export const CATEGORY_TO_DEPARTMENT: Record<
  SupportTicketCategory,
  SupportTicketDepartment
> = {
  account_banned: "account_security",

  account: "call_center",

  technical: "it",

  payments: "payments",

  orders: "orders",

  logistics: "logistics",

  listings: "moderation",

  moderation: "moderation",

  other: "call_center",
};

/**
 * =========================================================
 * ROLE → DEPARTMENT
 * =========================================================
 *
 * Admin:
 * null = acces la toate departamentele.
 */

export const ROLE_DEPARTMENTS: Record<
  SupportRole,
  SupportTicketDepartment | null
> = {
  admin: null,

  support_agent: "call_center",

  support_manager: "call_center",

  it_agent: "it",

  finance_agent: "payments",

  logistics_agent: "logistics",

  moderator: "moderation",
};
