/**
 * Canonical Business Engine — AYXA Planner Pro
 * Single source of truth for business projects, clients, offers, invoices,
 * payments, milestones, and financial derivations.
 *
 * Invariants:
 * - Finance is the SOLE canonical financial ledger.
 * - Invoices and estimates are NEVER counted as revenue until confirmed payment
 *   is posted to the Finance ledger.
 * - Monetary values use integer minor units (cents/centimes).
 * - Tasks and Focus time use canonical Tasks and Focus engines.
 */

import type { FinancialTransaction } from "./financeEngine";
import { toMinorUnits, fromMinorUnits } from "./financeEngine";

export type ProjectStatus =
  | "planned"
  | "active"
  | "waiting"
  | "paused"
  | "completed"
  | "archived";

export type ProjectProgressMethod = "milestones" | "tasks" | "manual";

export type ClientStatus = "lead" | "active" | "past" | "archived";
export type ClientPriority = "low" | "medium" | "high";

export type OfferType =
  | "service"
  | "product"
  | "digital_product"
  | "package"
  | "custom";

export type OfferStatus = "draft" | "active" | "paused" | "archived";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled";

export type BusinessPeriod =
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "this_year"
  | "all_time";

export interface BusinessProfile {
  id: string;
  businessName: string;
  logoStorageReference?: string;
  ownerDisplayName?: string;
  email?: string;
  phone?: string;
  address?: string;
  defaultCurrency: string;
  defaultPaymentTerms?: string;
  invoicePrefix: string;
  nextInvoiceSequence: number;
  defaultInvoiceNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProject {
  id: string;
  clientId?: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  progressMethod: ProjectProgressMethod;
  progressPercentage: number; // 0-100
  startDate?: string; // YYYY-MM-DD
  targetDate?: string; // YYYY-MM-DD
  agreedAmountMinor: number;
  currency: string;
  completedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate?: string;
  order: number;
  weight: number; // default 1
  status: "pending" | "completed";
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTaskLink {
  id: string;
  projectId: string;
  milestoneId?: string;
  taskId: string;
  createdAt: string;
}

export interface BusinessClient {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  preferredContactMethod?: "email" | "phone" | "whatsapp" | "other";
  status: ClientStatus;
  tags: string[];
  favorite: boolean;
  priority: ClientPriority;
  notes?: string;
  lastContactDate?: string;
  followUpDate?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessOffer {
  id: string;
  type: OfferType;
  title: string;
  description?: string;
  includedItems: string[];
  priceMinor: number;
  currency: string;
  deliveryEstimate?: string;
  status: OfferStatus;
  internalNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  offerId?: string;
  descriptionSnapshot: string;
  quantityDecimal: number;
  unitPriceMinor: number;
  subtotalMinor: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoicePaymentLink {
  id: string;
  invoiceId: string;
  financeTransactionId: string;
  amountMinor: number;
  currency: string;
  linkedAt: string;
  removedAt?: string;
}

export interface BusinessInvoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId?: string;
  currency: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  status: InvoiceStatus;
  terms?: string;
  note?: string;
  sentAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessNote {
  id: string;
  projectId?: string;
  clientId?: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessAttachment {
  id: string;
  projectId?: string;
  clientId?: string;
  invoiceId?: string;
  type: "document" | "image" | "contract" | "brief" | "deliverable";
  name: string;
  dataUrl: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

export interface BusinessActivityEvent {
  id: string;
  sourceType: "project" | "client" | "invoice" | "payment" | "expense" | "milestone";
  sourceId: string;
  eventType: string;
  eventTimestamp: string;
  title: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
}

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  id: "profile_main",
  businessName: "My Studio",
  defaultCurrency: "MAD",
  invoicePrefix: "INV-",
  nextInvoiceSequence: 1001,
  defaultPaymentTerms: "Payment due within 14 days of issue date.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Computes timezone-safe date range for a given BusinessPeriod.
 */
export function getDateRangeForPeriod(period: BusinessPeriod, refDate: Date = new Date()): { startDate?: string; endDate?: string } {
  const year = refDate.getFullYear();
  const month = refDate.getMonth(); // 0-indexed

  if (period === "this_month") {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return {
      startDate: `${year}-${pad(month + 1)}-01`,
      endDate: `${year}-${pad(month + 1)}-${pad(lastDay)}`,
    };
  }

  if (period === "last_month") {
    const lm = month === 0 ? 11 : month - 1;
    const ly = month === 0 ? year - 1 : year;
    const lastDay = new Date(ly, lm + 1, 0).getDate();
    return {
      startDate: `${ly}-${pad(lm + 1)}-01`,
      endDate: `${ly}-${pad(lm + 1)}-${pad(lastDay)}`,
    };
  }

  if (period === "this_quarter") {
    const qStartMonth = Math.floor(month / 3) * 3;
    const qEndMonth = qStartMonth + 2;
    const lastDay = new Date(year, qEndMonth + 1, 0).getDate();
    return {
      startDate: `${year}-${pad(qStartMonth + 1)}-01`,
      endDate: `${year}-${pad(qEndMonth + 1)}-${pad(lastDay)}`,
    };
  }

  if (period === "this_year") {
    return {
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
    };
  }

  return {}; // all_time
}

/**
 * Filter transactions by business provenance and optional period.
 */
export function filterBusinessTransactions(
  transactions: FinancialTransaction[],
  period: BusinessPeriod,
  refDate: Date = new Date()
): FinancialTransaction[] {
  const { startDate, endDate } = getDateRangeForPeriod(period, refDate);

  return transactions.filter((tx) => {
    if (tx.status !== "posted" || tx.deletedAt) return false;

    // Check if business-linked
    const isBusiness =
      tx.sourceType === "business" ||
      tx.categoryId === "inc_business" ||
      tx.categoryId === "exp_business";
    if (!isBusiness) return false;

    const txDate = tx.localDate || tx.occurredAt.slice(0, 10);
    if (startDate && txDate < startDate) return false;
    if (endDate && txDate > endDate) return false;

    return true;
  });
}

/**
 * Calculates canonical business finances strictly from Finance transactions.
 */
export function calculateBusinessFinances(
  transactions: FinancialTransaction[],
  period: BusinessPeriod,
  refDate: Date = new Date()
): {
  revenueMinor: number;
  expensesMinor: number;
  netProfitMinor: number;
  transactionCount: number;
} {
  const businessTxs = filterBusinessTransactions(transactions, period, refDate);

  let revenueMinor = 0;
  let expensesMinor = 0;

  for (const tx of businessTxs) {
    if (tx.type === "income") {
      for (const leg of tx.legs) {
        if (leg.signedAmountMinor > 0) {
          revenueMinor += leg.signedAmountMinor;
        }
      }
    } else if (tx.type === "expense") {
      for (const leg of tx.legs) {
        if (leg.signedAmountMinor < 0) {
          expensesMinor += Math.abs(leg.signedAmountMinor);
        }
      }
    } else if (tx.type === "refund") {
      // Linked refunds reduce expenses
      for (const leg of tx.legs) {
        if (leg.signedAmountMinor > 0) {
          expensesMinor = Math.max(0, expensesMinor - leg.signedAmountMinor);
        }
      }
    }
  }

  return {
    revenueMinor,
    expensesMinor,
    netProfitMinor: revenueMinor - expensesMinor,
    transactionCount: businessTxs.length,
  };
}

/**
 * Calculates line items subtotal and invoice totals.
 */
export function calculateInvoiceTotals(
  items: Array<{ quantityDecimal: number; unitPriceMinor: number }>,
  discountMinor: number = 0,
  taxMinor: number = 0
): {
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
} {
  let subtotalMinor = 0;
  for (const item of items) {
    const qty = Math.max(0, item.quantityDecimal || 0);
    const price = Math.max(0, item.unitPriceMinor || 0);
    subtotalMinor += Math.round(qty * price);
  }

  const safeDiscount = Math.min(subtotalMinor, Math.max(0, discountMinor));
  const afterDiscount = subtotalMinor - safeDiscount;
  const safeTax = Math.max(0, taxMinor);
  const totalMinor = afterDiscount + safeTax;

  return {
    subtotalMinor,
    discountMinor: safeDiscount,
    taxMinor: safeTax,
    totalMinor,
  };
}

/**
 * Calculates paid amount and derives invoice status from valid linked Finance transactions.
 */
export function calculateInvoiceFinancials(
  invoice: BusinessInvoice,
  paymentLinks: InvoicePaymentLink[],
  transactions: FinancialTransaction[],
  todayStr: string = new Date().toISOString().slice(0, 10)
): {
  paidMinor: number;
  outstandingMinor: number;
  derivedStatus: InvoiceStatus;
} {
  if (invoice.status === "cancelled") {
    return {
      paidMinor: 0,
      outstandingMinor: 0,
      derivedStatus: "cancelled",
    };
  }

  // Active payment links for this invoice
  const links = paymentLinks.filter((l) => l.invoiceId === invoice.id && !l.removedAt);
  let paidMinor = 0;

  for (const link of links) {
    const tx = transactions.find((t) => t.id === link.financeTransactionId);
    // Only count if Finance transaction is posted and not deleted/voided
    if (tx && tx.status === "posted" && !tx.deletedAt) {
      paidMinor += Math.max(0, link.amountMinor);
    }
  }

  const outstandingMinor = Math.max(0, invoice.totalMinor - paidMinor);

  let derivedStatus: InvoiceStatus = invoice.status;
  if (invoice.status !== "draft") {
    if (paidMinor >= invoice.totalMinor && invoice.totalMinor > 0) {
      derivedStatus = "paid";
    } else if (paidMinor > 0) {
      derivedStatus = "partially_paid";
    } else if (invoice.dueDate && invoice.dueDate < todayStr && outstandingMinor > 0) {
      derivedStatus = "overdue";
    } else if (invoice.sentAt || invoice.status === "sent") {
      derivedStatus = "sent";
    }
  }

  return {
    paidMinor,
    outstandingMinor,
    derivedStatus,
  };
}

/**
 * Calculates project progress based on the selected method.
 */
export function calculateProjectProgress(
  project: BusinessProject,
  milestones: ProjectMilestone[],
  taskLinks: ProjectTaskLink[],
  tasks: Array<{ id: string; done: boolean }>
): number {
  if (project.status === "completed") return 100;

  if (project.progressMethod === "manual") {
    return Math.min(100, Math.max(0, Math.round(project.progressPercentage || 0)));
  }

  if (project.progressMethod === "milestones") {
    const projMilestones = milestones.filter((m) => m.projectId === project.id);
    if (projMilestones.length === 0) return 0;

    let totalWeight = 0;
    let completedWeight = 0;
    for (const m of projMilestones) {
      const w = Math.max(1, m.weight || 1);
      totalWeight += w;
      if (m.status === "completed") {
        completedWeight += w;
      }
    }
    return totalWeight > 0 ? Math.min(100, Math.round((completedWeight / totalWeight) * 100)) : 0;
  }

  if (project.progressMethod === "tasks") {
    const links = taskLinks.filter((l) => l.projectId === project.id);
    if (links.length === 0) return 0;

    const taskIds = Array.from(new Set(links.map((l) => l.taskId)));
    const linkedTasks = tasks.filter((t) => taskIds.includes(t.id));
    if (linkedTasks.length === 0) return 0;

    const doneCount = linkedTasks.filter((t) => t.done).length;
    return Math.min(100, Math.round((doneCount / linkedTasks.length) * 100));
  }

  return 0;
}

/**
 * Calculates project financials (Invoiced, Paid Revenue, Expenses, Profit).
 */
export function calculateProjectFinancials(
  projectId: string,
  invoices: BusinessInvoice[],
  paymentLinks: InvoicePaymentLink[],
  transactions: FinancialTransaction[]
): {
  invoicedMinor: number;
  paidRevenueMinor: number;
  expensesMinor: number;
  profitMinor: number;
  outstandingMinor: number;
} {
  const projInvoices = invoices.filter((inv) => inv.projectId === projectId && inv.status !== "cancelled");
  let invoicedMinor = 0;
  let paidRevenueMinor = 0;

  for (const inv of projInvoices) {
    invoicedMinor += inv.totalMinor;
    const fin = calculateInvoiceFinancials(inv, paymentLinks, transactions);
    paidRevenueMinor += fin.paidMinor;
  }

  // Expenses directly linked to project in Finance
  let expensesMinor = 0;
  for (const tx of transactions) {
    if (tx.status !== "posted" || tx.deletedAt) continue;
    if (tx.sourceType === "business" && tx.sourceId === projectId) {
      if (tx.type === "expense") {
        for (const l of tx.legs) {
          if (l.signedAmountMinor < 0) {
            expensesMinor += Math.abs(l.signedAmountMinor);
          }
        }
      } else if (tx.type === "refund") {
        for (const l of tx.legs) {
          if (l.signedAmountMinor > 0) {
            expensesMinor = Math.max(0, expensesMinor - l.signedAmountMinor);
          }
        }
      }
    }
  }

  const outstandingMinor = Math.max(0, invoicedMinor - paidRevenueMinor);
  const profitMinor = paidRevenueMinor - expensesMinor;

  return {
    invoicedMinor,
    paidRevenueMinor,
    expensesMinor,
    profitMinor,
    outstandingMinor,
  };
}

/**
 * Derives completed Focus time for Business or a specific project.
 */
export function calculateBusinessFocusMinutes(
  sessions: Array<{
    status: string;
    sourceType?: string;
    sourceId?: string;
    actualFocusSeconds?: number;
    localDate?: string;
  }>,
  period?: BusinessPeriod,
  projectId?: string,
  refDate: Date = new Date()
): number {
  const { startDate, endDate } = period ? getDateRangeForPeriod(period, refDate) : { startDate: undefined, endDate: undefined };

  let totalSeconds = 0;
  for (const s of sessions) {
    if (s.status !== "completed") continue;
    if (s.sourceType !== "business") continue;

    if (projectId && s.sourceId !== projectId) continue;

    if (startDate && s.localDate && s.localDate < startDate) continue;
    if (endDate && s.localDate && s.localDate > endDate) continue;

    totalSeconds += Math.max(0, s.actualFocusSeconds || 0);
  }

  return Math.round(totalSeconds / 60);
}
