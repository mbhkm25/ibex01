"use server";

import { db } from "@/db";
import { users, stores } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

const CashierSchema = z.object({
  fullName: z.string().min(2, "الاسم مطلوب"),
  phone: z.string().min(9, "رقم الهاتف غير صالح"),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
});

export async function createCashier(prevState: Record<string, unknown> | null, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { message: "Unauthorized" };

  const userId = parseInt(session.user.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userStore = await db.select().from(stores).where(eq(stores.ownerId, userId)).then((res: any) => res[0]);

  if (!userStore) return { message: "Store not found" };

  const validatedFields = CashierSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { message: "البيانات غير صالحة" };
  }

  const { fullName, phone, password } = validatedFields.data;

  try {
      const existing = await db.select().from(users).where(eq(users.phone, phone));
      if (existing.length > 0) return { message: "رقم الهاتف مستخدم بالفعل" };

      const hashedPassword = await bcrypt.hash(password, 10);

      await db.insert(users).values({
          fullName,
          phone,
          password: hashedPassword,
          role: "cashier",
          storeId: userStore.id
      });
      
      revalidatePath("/dashboard/merchant");
      return { success: true };
  } catch {
      return { message: "Error creating cashier" };
  }
}

export async function getStoreCashiers(storeId?: number) {
    if (!storeId) {
        const session = await auth();
        if (!session?.user?.id) return [];
        const userId = parseInt(session.user.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userStore = await db.select().from(stores).where(eq(stores.ownerId, userId)).then((res: any) => res[0]);
        if (!userStore) return [];
        storeId = userStore.id;
    }

    const resolvedStoreId = storeId as number;

    return await db.select().from(users).where(and(eq(users.storeId, resolvedStoreId), eq(users.role, "cashier")));
}

