"use server";

import { db } from "@/db";
import { transactions, storeMemberships, stores, users } from "@/db/schema";
import { and, eq, sql, gte, lt, desc } from "drizzle-orm";
import { auth } from "@/auth";
import Decimal from "decimal.js";

export async function getMerchantStats(storeId?: number) {
  if (!storeId) {
     const session = await auth();
     if (!session?.user?.id) return null;
     const userId = parseInt(session.user.id);
     const userStore = await db.select().from(stores).where(eq(stores.ownerId, userId)).then(res => res[0]);
     if (!userStore) return null;
     storeId = userStore.id;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. Today's Sales (Purchase transactions created today)
  const todaySalesResult = await db
    .select({
      total: sql<string>`sum(${transactions.amount})`
    })
    .from(transactions)
    .innerJoin(storeMemberships, eq(transactions.membershipId, storeMemberships.id))
    .where(
      and(
        eq(storeMemberships.storeId, storeId),
        eq(transactions.type, "purchase"),
        gte(transactions.createdAt, today),
        lt(transactions.createdAt, tomorrow)
      )
    );

  // 2. Total Pending Debts (Sum of negative balances)
  // We want the absolute value sum of negative balances
  const totalDebtsResult = await db
    .select({
        total: sql<string>`sum(abs(${storeMemberships.currentBalance}))`
    })
    .from(storeMemberships)
    .where(
        and(
            eq(storeMemberships.storeId, storeId),
            lt(storeMemberships.currentBalance, "0")
        )
    );

  // 3. Total Deposits (All time deposits)
  const totalDepositsResult = await db
    .select({
      total: sql<string>`sum(${transactions.amount})`
    })
    .from(transactions)
    .innerJoin(storeMemberships, eq(transactions.membershipId, storeMemberships.id))
    .where(
      and(
        eq(storeMemberships.storeId, storeId),
        eq(transactions.type, "deposit")
      )
    );

  return {
    todaySales: todaySalesResult[0]?.total || "0",
    totalDebts: totalDebtsResult[0]?.total || "0",
    totalDeposits: totalDepositsResult[0]?.total || "0",
  };
}

export async function getLast7DaysTransactions(storeId?: number) {
    if (!storeId) {
        const session = await auth();
        if (!session?.user?.id) return [];
        const userId = parseInt(session.user.id);
        const userStore = await db.select().from(stores).where(eq(stores.ownerId, userId)).then(res => res[0]);
        if (!userStore) return [];
        storeId = userStore.id;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const result = await db
        .select({
            date: sql<string>`DATE(${transactions.createdAt})`,
            type: transactions.type,
            amount: sql<string>`sum(${transactions.amount})`
        })
        .from(transactions)
        .innerJoin(storeMemberships, eq(transactions.membershipId, storeMemberships.id))
        .where(
            and(
                eq(storeMemberships.storeId, storeId),
                gte(transactions.createdAt, sevenDaysAgo)
            )
        )
        .groupBy(sql`DATE(${transactions.createdAt})`, transactions.type)
        .orderBy(sql`DATE(${transactions.createdAt})`);

    const chartData: Record<string, { date: string, purchase: number, deposit: number }> = {};
    
    // Initialize last 7 days with 0
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        chartData[dateStr] = { date: new Date(d).toLocaleDateString("ar-YE", { weekday: 'short', day: 'numeric', month: 'numeric' }), purchase: 0, deposit: 0 };
    }

    result.forEach(row => {
        const dateStr = String(row.date);
        const d = new Date(dateStr);
        // We use the ISO string key to match but display localized date
        const key = d.toISOString().split('T')[0];
        
        // Find if key roughly matches (timezone issues might occur, but let's assume server time consistency or simple date match)
        // Actually, let's just loop through our initialized keys and match
        if (chartData[key]) {
             if (row.type === 'purchase') {
                chartData[key].purchase += Number(row.amount);
            } else if (row.type === 'deposit') {
                chartData[key].deposit += Number(row.amount);
            }
        }
    });

    return Object.values(chartData).reverse(); // Reverse because we generated Today -> Past, but chart wants Past -> Today usually? Or we can just sort.
    // Actually our init loop went Today -> Past (0 -> 6). We want Past -> Today.
}

export async function getDebtors(storeId?: number) {
    if (!storeId) {
        const session = await auth();
        if (!session?.user?.id) return [];
        const userId = parseInt(session.user.id);
        const userStore = await db.select().from(stores).where(eq(stores.ownerId, userId)).then(res => res[0]);
        if (!userStore) return [];
        storeId = userStore.id;
    }

    const debtors = await db
        .select({
            id: storeMemberships.id,
            fullName: users.fullName,
            phone: users.phone,
            currentBalance: storeMemberships.currentBalance,
            joinedAt: storeMemberships.joinedAt
        })
        .from(storeMemberships)
        .innerJoin(users, eq(storeMemberships.userId, users.id))
        .where(
            and(
                eq(storeMemberships.storeId, storeId),
                lt(storeMemberships.currentBalance, "0")
            )
        )
        .orderBy(storeMemberships.currentBalance); // Ascending (most negative first)

    return debtors;
}
