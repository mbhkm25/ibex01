"use server";

import { db } from "@/db";
import { storeMemberships, stores, transactions, users } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import Decimal from "decimal.js";

// ... previous code ...

export async function processTransaction(
  membershipId: number,
  type: "deposit" | "purchase",
  amount: string,
  note?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "غير مصرح لك بالقيام بهذا الإجراء." };
  }

  const processorId = parseInt(session.user.id);
  const amountDecimal = new Decimal(amount);

  if (amountDecimal.lessThanOrEqualTo(0)) {
    return { message: "المبلغ يجب أن يكون أكبر من صفر." };
  }

  try {
    return await db.transaction(async (tx) => {
      // 1. Get membership and verify authorization
      // We need to fetch user role to check permissions
      const processor = await tx.select().from(users).where(eq(users.id, processorId)).then(res => res[0]);
      
      const membership = await tx
        .select({
            id: storeMemberships.id,
            currentBalance: storeMemberships.currentBalance,
            creditLimit: storeMemberships.creditLimit,
            storeId: storeMemberships.storeId,
            storeOwnerId: stores.ownerId,
            storeName: stores.name // Added for receipt
        })
        .from(storeMemberships)
        .innerJoin(stores, eq(storeMemberships.storeId, stores.id))
        .where(eq(storeMemberships.id, membershipId))
        .then((res) => res[0]);

      if (!membership) {
        throw new Error("العضوية غير موجودة.");
      }

      // Authorization logic:
      // If merchant, must own store.
      // If cashier, must belong to store.
      let authorized = false;
      if (processor?.role === "merchant" && membership.storeOwnerId === processorId) {
          authorized = true;
      } else if (processor?.role === "cashier" && processor.storeId === membership.storeId) {
          authorized = true;
      }

      if (!authorized) {
        throw new Error("غير مصرح لك بإجراء عمليات لهذا العميل.");
      }

      const currentBalance = new Decimal(membership.currentBalance);
      const creditLimit = new Decimal(membership.creditLimit);
      let newBalance: Decimal;

      if (type === "purchase") {
        if (currentBalance.plus(creditLimit).lessThan(amountDecimal)) {
           throw new Error("رصيد العميل لا يكفي لإتمام العملية.");
        }
        newBalance = currentBalance.minus(amountDecimal);
      } else {
        newBalance = currentBalance.plus(amountDecimal);
      }

      // 2. Update membership balance
      await tx
        .update(storeMemberships)
        .set({ currentBalance: newBalance.toString() })
        .where(eq(storeMemberships.id, membershipId));

      // 3. Create transaction record
      const [newTx] = await tx.insert(transactions).values({
        membershipId,
        type: type === "purchase" ? "purchase" : "deposit",
        amount: amountDecimal.toString(),
        balanceAfter: newBalance.toString(),
        note: note || null,
        processedBy: processorId,
      }).returning({ id: transactions.id, createdAt: transactions.createdAt }); // Return ID/Date for receipt

      return { 
          success: true, 
          data: {
              transactionId: newTx.id,
              date: newTx.createdAt,
              amount: amountDecimal.toString(),
              type: type,
              storeName: membership.storeName,
              balanceAfter: newBalance.toString()
          }
      };
    });
  } catch (error: any) {
    console.error("Transaction error:", error);
    return { message: error.message || "حدث خطأ أثناء معالجة العملية." };
  }
}
