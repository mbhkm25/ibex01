"use server";

import { db } from "@/db";
import { storeMemberships, stores, users } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Decimal from "decimal.js";

// ... previous code ...
// Re-exporting joinStore etc. 
// I need to update getStoreCustomers logic.

export async function joinStore(prevState: Record<string, unknown> | null, formData: FormData) {
  // ... existing code ...
  // Keep as is, copy from previous if needed, but I am editing specific function below
  // For brevity I will just rewrite the file content carefully or use search_replace if risky.
  // Actually, I'll rewrite the whole file to be safe as I need `getStoreCustomers` modified.
  
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "يجب تسجيل الدخول أولاً." };
  }

  const userId = parseInt(session.user.id);
  const storeId = parseInt(formData.get("storeId") as string);

  if (!storeId) {
      return { message: "بيانات المتجر غير صحيحة." };
  }

  // Check if already a member
  const existingMembershipRes = await db
    .select()
    .from(storeMemberships)
    .where(
      and(
        eq(storeMemberships.userId, userId),
        eq(storeMemberships.storeId, storeId)
      )
    );

  const existingMembership = existingMembershipRes[0];


  if (existingMembership) {
    redirect("/dashboard/customer");
  }

  try {
    await db.insert(storeMemberships).values({
      userId,
      storeId,
      currentBalance: "0",
      creditLimit: "0",
      status: "active",
    });
  } catch (error) {
    console.error("Join store error:", error);
    return { message: "حدث خطأ أثناء الانضمام للمتجر." };
  }

  revalidatePath("/dashboard/customer");
  redirect("/dashboard/customer");
}

export async function getCustomerMemberships() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = parseInt(session.user.id);

  const memberships = await db
    .select({
      storeId: stores.id,
      storeName: stores.name,
      storeSlug: stores.slug,
      storeLogo: stores.logo,
      currentBalance: storeMemberships.currentBalance,
      creditLimit: storeMemberships.creditLimit,
      joinedAt: storeMemberships.joinedAt,
      storePhone: stores.whatsappNumber
    })
    .from(storeMemberships)
    .innerJoin(stores, eq(storeMemberships.storeId, stores.id))
    .where(eq(storeMemberships.userId, userId))
    .orderBy(desc(storeMemberships.joinedAt));

  return memberships;
}

export async function getStoreCustomers() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const userId = parseInt(session.user.id);
  
  // Fetch user role and store info
  const userRes = await db.select().from(users).where(eq(users.id, userId));
  const user = userRes[0];
  if (!user) return [];

  let storeId: number | undefined;

  if (user.role === 'merchant') {
      const storeRes = await db.select().from(stores).where(eq(stores.ownerId, userId));
      const store = storeRes[0];
      storeId = store?.id;
  } else if (user.role === 'cashier') {
      storeId = user.storeId || undefined;
  }

  if (!storeId) return [];

  const customers = await db
    .select({
      id: users.id,
      membershipId: storeMemberships.id,
      fullName: users.fullName,
      phone: users.phone,
      currentBalance: storeMemberships.currentBalance,
      joinedAt: storeMemberships.joinedAt,
      status: storeMemberships.status,
    })
    .from(storeMemberships)
    .innerJoin(users, eq(storeMemberships.userId, users.id))
    .where(eq(storeMemberships.storeId, storeId))
    .orderBy(desc(storeMemberships.joinedAt));

  return customers;
}

export async function updateCreditLimit(membershipId: number, newLimit: string) {
    const session = await auth();
    if (!session?.user?.id) {
      return { message: "غير مصرح لك." };
    }
  
    const merchantId = parseInt(session.user.id);
    const limitDecimal = new Decimal(newLimit);
  
    if (limitDecimal.lessThan(0)) {
      return { message: "سقف الائتمان لا يمكن أن يكون سالباً." };
    }
  
    try {
        // Verify ownership (Only merchant can update limit)
        const membershipRes = await db.select({
            id: storeMemberships.id,
            storeOwnerId: stores.ownerId
        })
        .from(storeMemberships)
        .innerJoin(stores, eq(storeMemberships.storeId, stores.id))
        .where(eq(storeMemberships.id, membershipId));

        const membership = membershipRes[0];
        if (!membership || membership.storeOwnerId !== merchantId) {
            return { message: "غير مصرح لك بتعديل هذا العميل." };
        }

        await db.update(storeMemberships)
            .set({ creditLimit: limitDecimal.toString() })
            .where(eq(storeMemberships.id, membershipId));
        
        revalidatePath(`/dashboard/merchant/customers/${membershipId}`);
        return { success: true };
    } catch {
      return { message: "حدث خطأ أثناء التحديث." };
    }
}
