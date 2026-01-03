"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const SettingsSchema = z.object({
  fullName: z.string().min(2, "الاسم مطلوب"),
  password: z.string().optional(),
});

export async function updateSettings(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return { message: "Unauthorized" };

    const userId = parseInt(session.user.id);
    const fullName = formData.get("fullName") as string;
    const password = formData.get("password") as string;

    const validated = SettingsSchema.safeParse({ fullName, password: password || undefined });
    
    if (!validated.success) return { message: "بيانات غير صالحة" };

    try {
        const updateData: any = { fullName: validated.data.fullName };
        
        if (password && password.length >= 6) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await db.update(users).set(updateData).where(eq(users.id, userId));
        
        return { success: true, message: "تم تحديث البيانات بنجاح" };
    } catch (e) {
        return { message: "Error updating settings" };
    }
}

