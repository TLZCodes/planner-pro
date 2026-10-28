/**
 * Canonical Finance Engine — Decimal-Safe Minor Units & Ledger Invariants
 * AYXA Planner Pro — Financial Core
 */

export type AccountType = "cash" | "bank" | "savings" | "wallet" | "credit_debt" | "other";
export type BalanceClass = "asset" | "liability";

export interface FinanceAccount {
  id: string;
  userId?: string;
  name: string;
  type: AccountType;
  balanceClass: BalanceClass;
  currency: string;
  openingBalanceMinor: number;
  icon: string;
  color: string;
  includeInTotals: boolean;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

export type TransactionType =
  | "income"
  | "expense"
  | "transfer"
  | "refund"
  | "savings_contribution"
  | "balance_adjustment";

export type TransactionStatus = "posted" | "pending" | "scheduled" | "voided";

export interface FinancialTransactionLeg {
  id: string;
  transactionId: string;
  accountId: string;
  signedAmountMinor: number; // Positive = credit/inflow, Negative = debit/outflow
  currency: string;
  baseCurrency?: string;
  baseAmountMinorSnapshot?: number;
  exchangeRateSnapshotId?: string;
  legType: "source" | "destination" | "fee" | "adjustment";
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  userId?: string;
  type: TransactionType;
  status: TransactionStatus;
  categoryId: string;
  merchantOrSource: string;
  occurredAt: string; // ISO
  localDate: string; // YYYY-MM-DD
  note?: string;
  tags?: string[];
  recurringTemplateId?: string;
  originalTransactionId?: string; // For refunds
  sourceType?: "manual" | "business" | "travel" | "goal" | "sadaqah";
  sourceId?: string;
  idempotencyKey?: string;
  receiptAttachment?: string; // base64 / data url stored locally
  legs: FinancialTransactionLeg[];
  createdAt: string;
  updatedAt: string;
  voidedAt?: string;
  deletedAt?: string;
}

export interface FinancialCategory {
  id: string;
  type: "income" | "expense";
  localizedBuiltInKey?: string;
  name: string;
  icon: string;
  color: string;
  builtIn: boolean;
  archived: boolean;
}

export interface BudgetCategoryLimit {
  categoryId: string;
  limitMinor: number;
}

export interface Budget {
  id: string;
  name: string;
  month: string; // YYYY-MM
  currency: string;
  overallLimitMinor?: number;
  categoryLimits: BudgetCategoryLimit[];
  rolloverEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  icon: string;
  currency: string;
  targetAmountMinor: number;
  targetDate?: string;
  linkedAccountId?: string;
  linkedGoalId?: string;
  linkedTravelPlanId?: string;
  status: "active" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface SavingsContribution {
  id: string;
  savingsGoalId: string;
  mode: "account_transfer" | "virtual_allocation";
  transactionId?: string; // If mode is account_transfer
  sourceAccountId?: string;
  amountMinor: number;
  currency: string;
  localDate: string;
  note?: string;
  createdAt: string;
}

export interface RecurringTransactionTemplate {
  id: string;
  transactionType: TransactionType;
  amountMinor: number;
  currency: string;
  accountId: string;
  destinationAccountId?: string;
  categoryId: string;
  merchantOrSource: string;
  frequency: "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  autoPost: boolean;
  reminder: boolean;
  status: "active" | "paused";
  createdAt: string;
  updatedAt: string;
}

export interface FinanceSettings {
  baseCurrency: string; // Defaults to "MAD"
  balancesHidden: boolean;
  hideOnBackground: boolean;
  financeLockEnabled: boolean;
  pinHash?: string; // SHA-256 hash with salt
  biometricEnabled?: boolean;
  autoLockMinutes: number;
}

// ─── Default Built-in Categories ─────────────────────────────────────────────

export const DEFAULT_FINANCE_CATEGORIES: FinancialCategory[] = [
  // Income
  { id: "inc_salary", type: "income", localizedBuiltInKey: "catSalary", name: "Salary", icon: "💼", color: "#10b981", builtIn: true, archived: false },
  { id: "inc_freelance", type: "income", localizedBuiltInKey: "catFreelance", name: "Freelance", icon: "💻", color: "#06b6d4", builtIn: true, archived: false },
  { id: "inc_business", type: "income", localizedBuiltInKey: "catBusinessInc", name: "Business", icon: "🏢", color: "#6366f1", builtIn: true, archived: false },
  { id: "inc_gift", type: "income", localizedBuiltInKey: "catGift", name: "Gift", icon: "🎁", color: "#ec4899", builtIn: true, archived: false },
  { id: "inc_refund", type: "income", localizedBuiltInKey: "catRefundInc", name: "Refund", icon: "↩️", color: "#8b5cf6", builtIn: true, archived: false },
  { id: "inc_other", type: "income", localizedBuiltInKey: "catOtherInc", name: "Other Income", icon: "✨", color: "#14b8a6", builtIn: true, archived: false },

  // Expense
  { id: "exp_housing", type: "expense", localizedBuiltInKey: "catHousing", name: "Housing", icon: "🏠", color: "#f97316", builtIn: true, archived: false },
  { id: "exp_food", type: "expense", localizedBuiltInKey: "catFood", name: "Food & Dining", icon: "🍜", color: "#eab308", builtIn: true, archived: false },
  { id: "exp_transport", type: "expense", localizedBuiltInKey: "catTransport", name: "Transport", icon: "🚗", color: "#3b82f6", builtIn: true, archived: false },
  { id: "exp_health", type: "expense", localizedBuiltInKey: "catHealth", name: "Health", icon: "🩺", color: "#ef4444", builtIn: true, archived: false },
  { id: "exp_selfcare", type: "expense", localizedBuiltInKey: "catSelfcare", name: "Self-care", icon: "🌸", color: "#f43f5e", builtIn: true, archived: false },
  { id: "exp_study", type: "expense", localizedBuiltInKey: "catStudy", name: "Study & Books", icon: "📚", color: "#8b5cf6", builtIn: true, archived: false },
  { id: "exp_family", type: "expense", localizedBuiltInKey: "catFamily", name: "Family", icon: "👨‍👩‍👧", color: "#d946ef", builtIn: true, archived: false },
  { id: "exp_giving", type: "expense", localizedBuiltInKey: "catGiving", name: "Giving & Sadaqah", icon: "🤲", color: "#059669", builtIn: true, archived: false },
  { id: "exp_travel", type: "expense", localizedBuiltInKey: "catTravel", name: "Travel", icon: "✈️", color: "#0284c7", builtIn: true, archived: false },
  { id: "exp_business", type: "expense", localizedBuiltInKey: "catBusinessExp", name: "Business", icon: "💼", color: "#4f46e5", builtIn: true, archived: false },
  { id: "exp_subscriptions", type: "expense", localizedBuiltInKey: "catSubscriptions", name: "Subscriptions", icon: "📱", color: "#a855f7", builtIn: true, archived: false },
  { id: "exp_shopping", type: "expense", localizedBuiltInKey: "catShopping", name: "Shopping", icon: "🛍️", color: "#ec4899", builtIn: true, archived: false },
  { id: "exp_other", type: "expense", localizedBuiltInKey: "catOtherExp", name: "Other", icon: "📦", color: "#64748b", builtIn: true, archived: false },
];

// ─── Default Accounts ────────────────────────────────────────────────────────

export function createDefaultMainAccount(currency = "MAD"): FinanceAccount {
  const now = new Date().toISOString();
  return {
    id: "acc_main_default",
    name: "Main Cash & Bank",
    type: "bank",
    balanceClass: "asset",
    currency,
    openingBalanceMinor: 0,
    icon: "💳",
    color: "#e11d48",
    includeInTotals: true,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
}

export const DEFAULT_FINANCE_SETTINGS: FinanceSettings = {
  baseCurrency: "MAD",
  balancesHidden: false,
  hideOnBackground: false,
  financeLockEnabled: false,
  autoLockMinutes: 5,
};

// ─── Decimal-Safe Minor Unit Math ─────────────────────────────────────────────

/**
 * Converts a standard decimal currency number or string to integer minor units (e.g. 10.50 -> 1050).
 */
export function toMinorUnits(val: number | string, decimals = 2): number {
  if (typeof val === "string") {
    val = parseFloat(val.replace(/,/g, "").trim()) || 0;
  }
  if (!isFinite(val) || isNaN(val)) return 0;
  return Math.round(val * Math.pow(10, decimals));
}

/**
 * Converts integer minor units back to a float representation (e.g. 1050 -> 10.50).
 */
export function fromMinorUnits(minor: number, decimals = 2): number {
  if (!isFinite(minor) || isNaN(minor)) return 0;
  return minor / Math.pow(10, decimals);
}

/**
 * Formats minor units into an authoritative, localized string.
 * Respects privacy masking when balances are hidden.
 */
export function formatMoney(
  amountMinor: number,
  currency = "MAD",
  balancesHidden = false,
  locale = "en-US",
  isAr = false
): string {
  if (balancesHidden) {
    return isAr ? "•••••• د.م." : "•••••• " + currency;
  }

  const value = fromMinorUnits(amountMinor);
  const formatted = new Intl.NumberFormat(isAr ? "ar-MA" : locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

  const sign = value < 0 ? "-" : "";
  const currLabel = isAr && currency === "MAD" ? "د.م." : currency;

  if (isAr) {
    return `${sign}${formatted} ${currLabel}`;
  }
  return `${sign}${formatted} ${currLabel}`;
}

/**
 * Compact format for badges or chart labels (e.g. 1.2k).
 */
export function formatMoneyCompact(
  amountMinor: number,
  currency = "MAD",
  balancesHidden = false,
  isAr = false
): string {
  if (balancesHidden) return "••••••";
  const val = fromMinorUnits(amountMinor);
  const sign = val < 0 ? "-" : "";
  const abs = Math.abs(val);

  let formatted = abs.toFixed(0);
  if (abs >= 1000000) {
    formatted = (abs / 1000000).toFixed(1) + "M";
  } else if (abs >= 1000) {
    formatted = (abs / 1000).toFixed(1) + "k";
  }

  const curr = isAr && currency === "MAD" ? "د.م." : currency;
  return `${sign}${formatted} ${curr}`;
}

// ─── Ledger Balance & Stats Calculations ──────────────────────────────────────

/**
 * Calculates current balance of a specific account based on opening balance
 * plus all valid posted transaction legs.
 */
export function calculateAccountBalanceMinor(
  account: FinanceAccount,
  transactions: FinancialTransaction[]
): number {
  let balanceMinor = account.openingBalanceMinor || 0;

  for (const tx of transactions) {
    if (tx.status === "voided" || tx.deletedAt) continue;
    if (tx.status === "scheduled") continue; // Scheduled future items don't affect current balance

    for (const leg of tx.legs || []) {
      if (leg.accountId === account.id) {
        balanceMinor += leg.signedAmountMinor;
      }
    }
  }

  return balanceMinor;
}

/**
 * Calculates total net position (Assets - Liabilities) in base currency.
 */
export function calculateNetPositionMinor(
  accounts: FinanceAccount[],
  transactions: FinancialTransaction[]
): { netPositionMinor: number; assetsTotalMinor: number; liabilitiesTotalMinor: number } {
  let assetsTotalMinor = 0;
  let liabilitiesTotalMinor = 0;

  for (const acc of accounts) {
    if (acc.status === "archived" || !acc.includeInTotals) continue;
    const bal = calculateAccountBalanceMinor(acc, transactions);

    if (acc.balanceClass === "liability") {
      liabilitiesTotalMinor += Math.max(0, bal);
    } else {
      assetsTotalMinor += bal;
    }
  }

  const netPositionMinor = assetsTotalMinor - liabilitiesTotalMinor;
  return { netPositionMinor, assetsTotalMinor, liabilitiesTotalMinor };
}

/**
 * Calculates monthly income, expenses, and net cash flow for a selected period (YYYY-MM).
 * - Excludes transfers, balance adjustments, and opening balances.
 * - Deducts valid linked refunds from expenses.
 */
export function calculateMonthlyStats(
  transactions: FinancialTransaction[],
  yearMonth: string // "YYYY-MM"
): {
  incomeMinor: number;
  expensesMinor: number;
  netCashFlowMinor: number;
  expensesByCategoryMinor: Record<string, number>;
  incomeByCategoryMinor: Record<string, number>;
  transactionCount: number;
} {
  let incomeMinor = 0;
  let expensesMinor = 0;
  const expensesByCategoryMinor: Record<string, number> = {};
  const incomeByCategoryMinor: Record<string, number> = {};
  let transactionCount = 0;

  for (const tx of transactions) {
    if (tx.status === "voided" || tx.deletedAt || tx.status === "scheduled") continue;
    const txMonth = tx.localDate ? tx.localDate.slice(0, 7) : tx.occurredAt.slice(0, 7);
    if (txMonth !== yearMonth) continue;

    transactionCount++;

    if (tx.type === "income") {
      // Outflow/inflow summed from legs
      const amt = tx.legs.reduce((sum, leg) => sum + Math.max(0, leg.signedAmountMinor), 0);
      incomeMinor += amt;
      incomeByCategoryMinor[tx.categoryId] = (incomeByCategoryMinor[tx.categoryId] || 0) + amt;
    } else if (tx.type === "expense") {
      const amt = tx.legs.reduce((sum, leg) => sum + Math.abs(Math.min(0, leg.signedAmountMinor)), 0);
      expensesMinor += amt;
      expensesByCategoryMinor[tx.categoryId] = (expensesByCategoryMinor[tx.categoryId] || 0) + amt;
    } else if (tx.type === "refund") {
      // A refund reduces the expense total
      const amt = tx.legs.reduce((sum, leg) => sum + Math.max(0, leg.signedAmountMinor), 0);
      expensesMinor = Math.max(0, expensesMinor - amt);
      if (expensesByCategoryMinor[tx.categoryId]) {
        expensesByCategoryMinor[tx.categoryId] = Math.max(0, expensesByCategoryMinor[tx.categoryId] - amt);
      }
    }
    // Transfers, balance adjustments, and savings contributions do NOT count as ordinary income/expense
  }

  const netCashFlowMinor = incomeMinor - expensesMinor;
  return {
    incomeMinor,
    expensesMinor,
    netCashFlowMinor,
    expensesByCategoryMinor,
    incomeByCategoryMinor,
    transactionCount,
  };
}

/**
 * Calculates budget category usage for the current budget period.
 */
export function calculateBudgetUsage(
  budget: Budget,
  transactions: FinancialTransaction[]
): {
  totalLimitMinor: number;
  totalSpentMinor: number;
  totalRemainingMinor: number;
  pctUsed: number;
  categoryUsages: {
    categoryId: string;
    limitMinor: number;
    spentMinor: number;
    remainingMinor: number;
    pctUsed: number;
  }[];
} {
  const { expensesByCategoryMinor } = calculateMonthlyStats(transactions, budget.month);

  let totalLimitMinor = budget.overallLimitMinor || 0;
  let totalSpentMinor = 0;

  const categoryUsages = (budget.categoryLimits || []).map((cl) => {
    const spentMinor = expensesByCategoryMinor[cl.categoryId] || 0;
    const remainingMinor = cl.limitMinor - spentMinor;
    const pctUsed = cl.limitMinor > 0 ? Math.round((spentMinor / cl.limitMinor) * 100) : 0;
    totalSpentMinor += spentMinor;
    if (!budget.overallLimitMinor) {
      totalLimitMinor += cl.limitMinor;
    }

    return {
      categoryId: cl.categoryId,
      limitMinor: cl.limitMinor,
      spentMinor,
      remainingMinor,
      pctUsed,
    };
  });

  const totalRemainingMinor = totalLimitMinor - totalSpentMinor;
  const pctUsed = totalLimitMinor > 0 ? Math.round((totalSpentMinor / totalLimitMinor) * 100) : 0;

  return {
    totalLimitMinor,
    totalSpentMinor,
    totalRemainingMinor,
    pctUsed,
    categoryUsages,
  };
}

/**
 * Calculates valid savings contributions toward a target.
 */
export function calculateSavingsProgressMinor(
  goal: SavingsGoal,
  contributions: SavingsContribution[]
): {
  currentAmountMinor: number;
  targetAmountMinor: number;
  remainingMinor: number;
  pct: number;
} {
  const goalContribs = contributions.filter((c) => c.savingsGoalId === goal.id);
  const currentAmountMinor = goalContribs.reduce((sum, c) => sum + c.amountMinor, 0);
  const targetAmountMinor = goal.targetAmountMinor || 1;
  const remainingMinor = Math.max(0, targetAmountMinor - currentAmountMinor);
  const pct = Math.min(100, Math.round((currentAmountMinor / targetAmountMinor) * 100));

  return {
    currentAmountMinor,
    targetAmountMinor,
    remainingMinor,
    pct,
  };
}

// ─── Transaction Builders ─────────────────────────────────────────────────────

export function createTransferTransaction(params: {
  sourceAccountId: string;
  destinationAccountId: string;
  amountMinor: number;
  currency: string;
  localDate: string;
  note?: string;
  merchantOrSource?: string;
}): FinancialTransaction {
  const txId = "tx_" + Math.random().toString(36).slice(2, 11);
  const now = new Date().toISOString();

  const sourceLeg: FinancialTransactionLeg = {
    id: "leg_" + Math.random().toString(36).slice(2, 11),
    transactionId: txId,
    accountId: params.sourceAccountId,
    signedAmountMinor: -Math.abs(params.amountMinor),
    currency: params.currency,
    legType: "source",
    createdAt: now,
  };

  const destLeg: FinancialTransactionLeg = {
    id: "leg_" + Math.random().toString(36).slice(2, 11),
    transactionId: txId,
    accountId: params.destinationAccountId,
    signedAmountMinor: Math.abs(params.amountMinor),
    currency: params.currency,
    legType: "destination",
    createdAt: now,
  };

  return {
    id: txId,
    type: "transfer",
    status: "posted",
    categoryId: "transfer",
    merchantOrSource: params.merchantOrSource || "Transfer between accounts",
    occurredAt: now,
    localDate: params.localDate,
    note: params.note,
    legs: [sourceLeg, destLeg],
    createdAt: now,
    updatedAt: now,
  };
}

export function createAdjustmentTransaction(params: {
  accountId: string;
  diffMinor: number;
  currency: string;
  localDate: string;
  observedBalanceMinor: number;
  note?: string;
}): FinancialTransaction {
  const txId = "adj_" + Math.random().toString(36).slice(2, 11);
  const now = new Date().toISOString();

  const leg: FinancialTransactionLeg = {
    id: "leg_" + Math.random().toString(36).slice(2, 11),
    transactionId: txId,
    accountId: params.accountId,
    signedAmountMinor: params.diffMinor,
    currency: params.currency,
    legType: "adjustment",
    createdAt: now,
  };

  return {
    id: txId,
    type: "balance_adjustment",
    status: "posted",
    categoryId: "adjustment",
    merchantOrSource: "Reconciliation Adjustment",
    occurredAt: now,
    localDate: params.localDate,
    note: params.note || `Balance adjustment to match observed ${formatMoney(params.observedBalanceMinor, params.currency)}`,
    legs: [leg],
    createdAt: now,
    updatedAt: now,
  };
}

// ─── Idempotent Migration from Legacy Money State ─────────────────────────────

export interface LegacyMoneyEntry {
  id: string;
  label: string;
  amount: number; // positive = income, negative = expense
  category: string;
  date: string;
}

export function migrateLegacyMoneyToCanonicalLedger(
  legacyMoney: LegacyMoneyEntry[] = [],
  existingAccounts: FinanceAccount[] = [],
  existingTransactions: FinancialTransaction[] = [],
  baseCurrency = "MAD"
): {
  accounts: FinanceAccount[];
  transactions: FinancialTransaction[];
} {
  // If we already have canonical accounts and transactions, don't re-migrate
  if (existingAccounts.length > 0 && existingTransactions.length > 0) {
    return { accounts: existingAccounts, transactions: existingTransactions };
  }

  // 1. Ensure at least one primary account exists
  let accounts = [...existingAccounts];
  let mainAccount = accounts.find((a) => a.id === "acc_main_default") || accounts[0];
  if (!mainAccount) {
    mainAccount = createDefaultMainAccount(baseCurrency);
    accounts = [mainAccount, ...accounts];
  }

  // 2. Map legacy transactions
  const transactions: FinancialTransaction[] = [...existingTransactions];
  const existingTxIds = new Set(transactions.map((t) => t.id));

  for (const entry of legacyMoney) {
    if (existingTxIds.has(entry.id)) continue;

    const isIncome = entry.amount > 0;
    const amountMinor = toMinorUnits(Math.abs(entry.amount));
    const now = new Date().toISOString();

    // Find category or fallback
    let catId = isIncome ? "inc_other" : "exp_other";
    const lowerCat = (entry.category || "").toLowerCase();
    if (lowerCat.includes("salary") || lowerCat.includes("income")) catId = "inc_salary";
    else if (lowerCat.includes("freelance")) catId = "inc_freelance";
    else if (lowerCat.includes("food")) catId = "exp_food";
    else if (lowerCat.includes("stud") || lowerCat.includes("book")) catId = "exp_study";
    else if (lowerCat.includes("self") || lowerCat.includes("skin")) catId = "exp_selfcare";
    else if (lowerCat.includes("travel")) catId = "exp_travel";
    else if (lowerCat.includes("shop")) catId = "exp_shopping";

    const leg: FinancialTransactionLeg = {
      id: "leg_" + entry.id,
      transactionId: entry.id,
      accountId: mainAccount.id,
      signedAmountMinor: isIncome ? amountMinor : -amountMinor,
      currency: baseCurrency,
      legType: isIncome ? "destination" : "source",
      createdAt: now,
    };

    transactions.push({
      id: entry.id,
      type: isIncome ? "income" : "expense",
      status: "posted",
      categoryId: catId,
      merchantOrSource: entry.label || (isIncome ? "Income" : "Expense"),
      occurredAt: entry.date ? `${entry.date}T12:00:00.000Z` : now,
      localDate: entry.date || now.slice(0, 10),
      legs: [leg],
      createdAt: now,
      updatedAt: now,
    });
  }

  return { accounts, transactions };
}
