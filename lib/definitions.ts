import { z } from "zod";

export const SignupFormSchema = z.object({
  fullName: z.string().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل" }),
  phone: z.string().min(9, { message: "رقم الهاتف غير صالح" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
  role: z.enum(["merchant", "customer"], { message: "الرجاء اختيار نوع الحساب" }),
});

export const LoginFormSchema = z.object({
  phone: z.string().min(9, { message: "رقم الهاتف مطلوب" }),
  password: z.string().min(1, { message: "كلمة المرور مطلوبة" }),
});

export const CreateStoreSchema = z.object({
  name: z.string().min(2, { message: "اسم المتجر مطلوب" }),
  description: z.string().optional(),
  whatsappNumber: z.string().min(9, { message: "رقم الواتساب مطلوب" }),
});

