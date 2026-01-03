"use server";

import { db } from "@/db";
import { products, stores } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ProductSchema = z.object({
  name: z.string().min(1, "اسم المنتج مطلوب"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "السعر غير صالح"),
  description: z.string().optional(),
  isAvailable: z.boolean().default(true),
});

export async function getStoreProducts(storeId?: number) {
    if (!storeId) {
        const session = await auth();
        if (!session?.user?.id) return [];
        const userId = parseInt(session.user.id);
        const userStore = await db.select().from(stores).where(eq(stores.ownerId, userId)).then(res => res[0]);
        if (!userStore) return [];
        storeId = userStore.id;
    }

  return await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId))
    .orderBy(desc(products.id));
}

export async function upsertProduct(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "غير مصرح لك." };
  }
  
  const userId = parseInt(session.user.id);
  const userStore = await db.select().from(stores).where(eq(stores.ownerId, userId)).then(res => res[0]);
  
  if (!userStore) {
      return { message: "لم يتم العثور على المتجر." };
  }

  const id = formData.get("id") ? parseInt(formData.get("id") as string) : undefined;
  
  const validatedFields = ProductSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    description: formData.get("description"),
    isAvailable: formData.get("isAvailable") === "true",
  });

  if (!validatedFields.success) {
    return { message: "البيانات غير صالحة." };
  }

  const { name, price, description, isAvailable } = validatedFields.data;

  try {
    if (id) {
      // Update
      await db.update(products)
        .set({ name, price, description, isAvailable })
        .where(and(eq(products.id, id), eq(products.storeId, userStore.id)));
    } else {
      // Create
      await db.insert(products).values({
        storeId: userStore.id,
        name,
        price,
        description,
        isAvailable,
      });
    }
    
    revalidatePath("/dashboard/merchant");
    return { success: true };
  } catch (error) {
    return { message: "حدث خطأ في قاعدة البيانات." };
  }
}

export async function deleteProduct(productId: number) {
  const session = await auth();
  if (!session?.user?.id) return { message: "Unauthorized" };
  
  const userId = parseInt(session.user.id);
  const userStore = await db.select().from(stores).where(eq(stores.ownerId, userId)).then(res => res[0]);

  if (!userStore) return { message: "Store not found" };

  try {
      await db.delete(products).where(and(eq(products.id, productId), eq(products.storeId, userStore.id)));
      revalidatePath("/dashboard/merchant");
      return { success: true };
  } catch (error) {
      return { message: "Failed to delete" };
  }
}

