"use server";

import { db } from "@/db";
import { stores } from "@/db/schema";
import { CreateStoreSchema } from "@/lib/definitions";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createStore(prevState: Record<string, unknown> | null, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: "غير مصرح لك بالقيام بهذا الإجراء." };
  }

  const validatedFields = CreateStoreSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    whatsappNumber: formData.get("whatsappNumber"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "البيانات غير صحيحة.",
    };
  }

  const { name, description, whatsappNumber } = validatedFields.data;
  const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Math.floor(Math.random() * 1000);

  try {
    await db.insert(stores).values({
      name,
      description,
      whatsappNumber,
      slug,
      ownerId: parseInt(session.user.id),
    });
  } catch (error) {
    console.error("Store creation error:", error);
    return {
      message: "فشل إنشاء المتجر. حاول مرة أخرى.",
    };
  }

  revalidatePath("/dashboard/merchant");
  return { success: true };
}

