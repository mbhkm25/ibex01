"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignupFormSchema } from "@/lib/definitions";
import { redirect } from "next/navigation";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "بيانات الدخول غير صحيحة.";
        default:
          return "حدث خطأ ما.";
      }
    }
    throw error;
  }
}

export async function register(
  prevState: any,
  formData: FormData,
) {
  const validatedFields = SignupFormSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "البيانات غير مكتملة. فشل في إنشاء الحساب.",
    };
  }

  const { fullName, phone, password, role } = validatedFields.data;
  
  try {
    const existingUser = await db.select().from(users).where(eq(users.phone, phone));
    if (existingUser.length > 0) {
      return {
        message: "رقم الهاتف مستخدم بالفعل.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      fullName,
      phone,
      password: hashedPassword,
      role: role as "merchant" | "customer",
    });
    
  } catch (error) {
    return {
      message: "حدث خطأ في قاعدة البيانات.",
    };
  }
  
  redirect("/login");
}
