import { Types } from "mongoose";

import User from "../../models/Users.js";
import { SupportTicket } from "./support.model.js";

import { getAllowedDepartments } from "./support.permissions.js";

import {
  type SupportTicketCategory,
  type SupportTicketDepartment,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from "./support.model.js";

import {
  CATEGORY_TO_DEPARTMENT,
  ROLE_DEPARTMENTS,
} from "./support.constants.js";

class SupportService {
  /**
   * =========================================================
   * USER
   * =========================================================
   */

  async createTicket(
    userId: string,
    data: {
      subject: string;
      category: SupportTicketCategory;
      message: string;
      priority?: SupportTicketPriority;
      banReason?: string | null;
    },
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("INVALID_USER_ID");
    }

    const subject = data.subject?.trim();
    const message = data.message?.trim();

    if (!subject) {
      throw new Error("SUBJECT_REQUIRED");
    }

    if (!message) {
      throw new Error("MESSAGE_REQUIRED");
    }

    if (subject.length > 200) {
      throw new Error("SUBJECT_TOO_LONG");
    }

    if (message.length > 5000) {
      throw new Error("MESSAGE_TOO_LONG");
    }

    /*
     * Departamentul este stabilit de backend.
     * Clientul nu poate trimite department.
     */
    const allowedCategories: SupportTicketCategory[] = [
      "account_banned",
      "account",
      "payments",
      "orders",
      "listings",
      "technical",
      "logistics",
      "moderation",
      "other",
    ];

    if (!allowedCategories.includes(data.category)) {
      throw new Error("INVALID_CATEGORY");
    }

    const department = CATEGORY_TO_DEPARTMENT[data.category];

    const ticket = await SupportTicket.create({
      user: userId,

      subject,

      category: data.category,

      department,

      priority: data.priority ?? "normal",

      status: "open",

      assignedTo: null,

      banReason: data.banReason?.trim() || null,

      messages: [
        {
          sender: userId,

          senderType: "user",

          message,

          createdAt: new Date(),
        },
      ],
    });

    return ticket;
  }

  /**
   * =========================================================
   * USER - LISTA TICKETELOR
   * =========================================================
   */

  async getUserTickets(
    userId: string,
    options?: {
      status?: SupportTicketStatus;
    },
  ) {
    const filter: Record<string, unknown> = {
      user: userId,
    };

    if (options?.status) {
      filter.status = options.status;
    }

    return SupportTicket.find(filter)
      .sort({ updatedAt: -1 })
      .populate("assignedTo", "_id username fullName email role department")
      .lean();
  }

  /**
   * =========================================================
   * USER - TICKET
   * =========================================================
   */

  async getUserTicket(userId: string, ticketId: string) {
    if (!Types.ObjectId.isValid(ticketId)) {
      throw new Error("INVALID_TICKET_ID");
    }

    const ticket = await SupportTicket.findOne({
      _id: ticketId,
      user: userId,
    })
      .populate("user", "_id username fullName email")
      .populate("assignedTo", "_id username fullName email role department");

    if (!ticket) {
      throw new Error("TICKET_NOT_FOUND");
    }

    return ticket;
  }

  /**
   * =========================================================
   * USER - ADAUGĂ MESAJ
   * =========================================================
   */

  async addUserMessage(userId: string, ticketId: string, message: string) {
    if (!Types.ObjectId.isValid(ticketId)) {
      throw new Error("INVALID_TICKET_ID");
    }

    const text = message?.trim();

    if (!text) {
      throw new Error("MESSAGE_REQUIRED");
    }

    if (text.length > 5000) {
      throw new Error("MESSAGE_TOO_LONG");
    }

    const ticket = await SupportTicket.findOne({
      _id: ticketId,
      user: userId,
    });

    if (!ticket) {
      throw new Error("TICKET_NOT_FOUND");
    }

    if (ticket.status === "closed") {
      throw new Error("TICKET_CLOSED");
    }

    ticket.messages.push({
      sender: new Types.ObjectId(userId),

      senderType: "user",

      message: text,

      createdAt: new Date(),
    });

    /*
     * Dacă utilizatorul răspunde unui ticket
     * care era pending, îl redeschidem.
     */
    if (ticket.status === "pending") {
      ticket.status = "open";
    }

    await ticket.save();

    return ticket;
  }

  /**
   * =========================================================
   * STAFF - PERMISSIONS
   * =========================================================
   */

  private async getStaff(userId: string) {
    const user = await User.findById(userId)
      .select("_id username fullName email role department banned")
      .lean();

    if (!user) {
      throw new Error("STAFF_NOT_FOUND");
    }

    const supportRoles = [
      "admin",
      "support_agent",
      "support_manager",
      "it_agent",
      "finance_agent",
      "logistics_agent",
      "moderator",
    ];

    if (!supportRoles.includes(user.role)) {
      throw new Error("SUPPORT_ACCESS_DENIED");
    }

    return user;
  }

  /**
   * Verifică dacă staff-ul poate accesa
   * departamentul ticketului.
   */
  private canAccessDepartment(
    staff: {
      role: string;
      department?: string | null;
    },
    department: string,
  ) {
    /*
     * Admin = acces complet.
     */
    if (staff.role === "admin") {
      return true;
    }

    /*
     * Verificare departament.
     */
    return staff.department === department;
  }

  /**
   * =========================================================
   * STAFF - LISTĂ TICKETE
   * =========================================================
   */

  async getStaffTickets(
    staffId: string,
    options?: {
      department?: SupportTicketDepartment;
      status?: SupportTicketStatus;
      assignedTo?: "me" | "unassigned" | string;
      priority?: SupportTicketPriority;
      limit?: number;
      skip?: number;
    },
  ) {
    const staff = await this.getStaff(staffId);

    const filter: Record<string, unknown> = {};

    /*
     * ADMIN
     *
     * Admin poate selecta orice departament.
     */
    if (staff.role === "admin") {
      if (options?.department) {
        filter.department = options.department;
      }
    } else {
      /*
       * Staff normal vede DOAR departamentul lui.
       */
      filter.department = staff.department;
    }

    /*
     * Status.
     */
    if (options?.status) {
      filter.status = options.status;
    }

    /*
     * Assigned.
     */
    if (options?.assignedTo === "me") {
      filter.assignedTo = new Types.ObjectId(staffId);
    }

    if (options?.assignedTo === "unassigned") {
      filter.assignedTo = null;
    }

    /*
     * Un ID specific.
     */
    if (
      options?.assignedTo &&
      options.assignedTo !== "me" &&
      options.assignedTo !== "unassigned" &&
      Types.ObjectId.isValid(options.assignedTo)
    ) {
      filter.assignedTo = new Types.ObjectId(options.assignedTo);
    }

    /*
     * Priority.
     */
    if (options?.priority) {
      filter.priority = options.priority;
    }

    const limit = Math.min(Math.max(options?.limit ?? 50, 1), 100);

    const skip = Math.max(options?.skip ?? 0, 0);

    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter)
        .sort({
          priority: -1,
          updatedAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .populate("user", "_id username fullName email")
        .populate("assignedTo", "_id username fullName email role department")
        .lean(),

      SupportTicket.countDocuments(filter),
    ]);

    return {
      tickets,
      total,
      limit,
      skip,
    };
  }

  /**
   * =========================================================
   * STAFF - DETALII TICKET
   * =========================================================
   */

  async getStaffTicket(staffId: string, ticketId: string) {
    if (!Types.ObjectId.isValid(ticketId)) {
      throw new Error("INVALID_TICKET_ID");
    }

    const staff = await this.getStaff(staffId);

    const ticket = await SupportTicket.findById(ticketId)
      .populate("user", "_id username fullName email phone")
      .populate("assignedTo", "_id username fullName email role department");

    if (!ticket) {
      throw new Error("TICKET_NOT_FOUND");
    }

    if (!this.canAccessDepartment(staff, ticket.department)) {
      throw new Error("DEPARTMENT_ACCESS_DENIED");
    }

    return ticket;
  }

  /**
   * =========================================================
   * STAFF - ASSIGN TO ME
   * =========================================================
   */

  async assignToMe(staffId: string, ticketId: string) {
    if (!Types.ObjectId.isValid(ticketId)) {
      throw new Error("INVALID_TICKET_ID");
    }

    const staff = await this.getStaff(staffId);

    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new Error("TICKET_NOT_FOUND");
    }

    if (!this.canAccessDepartment(staff, ticket.department)) {
      throw new Error("DEPARTMENT_ACCESS_DENIED");
    }

    ticket.assignedTo = new Types.ObjectId(staffId);

    /*
     * Când un agent preia ticketul,
     * acesta intră în lucru.
     */
    if (ticket.status === "open") {
      ticket.status = "pending";
    }

    await ticket.save();

    return ticket.populate([
      {
        path: "user",
        select: "_id username fullName email",
      },
      {
        path: "assignedTo",
        select: "_id username fullName email role department",
      },
    ]);
  }

  /**
   * =========================================================
   * STAFF - UNASSIGN
   * =========================================================
   */

  async unassignTicket(staffId: string, ticketId: string) {
    if (!Types.ObjectId.isValid(ticketId)) {
      throw new Error("INVALID_TICKET_ID");
    }

    const staff = await this.getStaff(staffId);

    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new Error("TICKET_NOT_FOUND");
    }

    if (!this.canAccessDepartment(staff, ticket.department)) {
      throw new Error("DEPARTMENT_ACCESS_DENIED");
    }

    ticket.assignedTo = null;

    if (ticket.status === "pending") {
      ticket.status = "open";
    }

    await ticket.save();

    return ticket;
  }

  /**
   * =========================================================
   * STAFF - SCHIMBĂ STATUS
   * =========================================================
   */

  async updateStatus(
    staffId: string,
    ticketId: string,
    status: SupportTicketStatus,
  ) {
    if (!Types.ObjectId.isValid(ticketId)) {
      throw new Error("INVALID_TICKET_ID");
    }

    const staff = await this.getStaff(staffId);

    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new Error("TICKET_NOT_FOUND");
    }

    if (!this.canAccessDepartment(staff, ticket.department)) {
      throw new Error("DEPARTMENT_ACCESS_DENIED");
    }

    ticket.status = status;

    await ticket.save();

    return ticket;
  }

  /**
   * =========================================================
   * STAFF - SCHIMBĂ PRIORITATEA
   * =========================================================
   */

  async updatePriority(
    staffId: string,
    ticketId: string,
    priority: SupportTicketPriority,
  ) {
    if (!Types.ObjectId.isValid(ticketId)) {
      throw new Error("INVALID_TICKET_ID");
    }

    const staff = await this.getStaff(staffId);

    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new Error("TICKET_NOT_FOUND");
    }

    if (!this.canAccessDepartment(staff, ticket.department)) {
      throw new Error("DEPARTMENT_ACCESS_DENIED");
    }

    ticket.priority = priority;

    await ticket.save();

    return ticket;
  }

  /**
   * =========================================================
   * STAFF - ADAUGĂ MESAJ
   * =========================================================
   */

  async addStaffMessage(staffId: string, ticketId: string, message: string) {
    if (!Types.ObjectId.isValid(ticketId)) {
      throw new Error("INVALID_TICKET_ID");
    }

    const text = message?.trim();

    if (!text) {
      throw new Error("MESSAGE_REQUIRED");
    }

    if (text.length > 5000) {
      throw new Error("MESSAGE_TOO_LONG");
    }

    const staff = await this.getStaff(staffId);

    const ticket = await SupportTicket.findById(ticketId);

    if (!ticket) {
      throw new Error("TICKET_NOT_FOUND");
    }

    if (!this.canAccessDepartment(staff, ticket.department)) {
      throw new Error("DEPARTMENT_ACCESS_DENIED");
    }

    if (ticket.status === "closed") {
      throw new Error("TICKET_CLOSED");
    }

    ticket.messages.push({
      sender: new Types.ObjectId(staffId),

      /*
       * Pentru moment păstrăm schema existentă
       * user/admin.
       *
       * Agentul este identificat prin sender.
       */
      senderType: "admin",

      message: text,

      createdAt: new Date(),
    });

    await ticket.save();

    return ticket;
  }

  /**
   * =========================================================
   * STAFF - STATISTICI SIDEBAR
   * =========================================================
   */

  async getStaffStats(staffId: string) {
    const staff = await this.getStaff(staffId);

    const filter: Record<string, unknown> = {};

    if (staff.role !== "admin") {
      filter.department = staff.department;
    }

    const [total, open, pending, closed, unassigned, urgent] =
      await Promise.all([
        SupportTicket.countDocuments(filter),

        SupportTicket.countDocuments({
          ...filter,
          status: "open",
        }),

        SupportTicket.countDocuments({
          ...filter,
          status: "pending",
        }),

        SupportTicket.countDocuments({
          ...filter,
          status: "closed",
        }),

        SupportTicket.countDocuments({
          ...filter,
          assignedTo: null,
        }),

        SupportTicket.countDocuments({
          ...filter,
          priority: "urgent",
          status: {
            $ne: "closed",
          },
        }),
      ]);

    const myTickets = await SupportTicket.countDocuments({
      ...filter,
      assignedTo: new Types.ObjectId(staffId),
      status: {
        $ne: "closed",
      },
    });

    return {
      total,
      open,
      pending,
      closed,
      unassigned,
      urgent,
      myTickets,
    };
  }

  async getStaffInfo(userId: string) {
    const staff = await User.findById(userId)
      .select("_id role department")
      .lean();

    if (!staff) {
      throw new Error("UNAUTHORIZED");
    }

    const departments = getAllowedDepartments(staff.role);

    return {
      id: staff._id.toString(),
      role: staff.role,
      department: staff.department ?? "general",
      departments,
    };
  }
}

export const supportService = new SupportService();
