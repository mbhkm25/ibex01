"use client";

import { useActionState } from "react";
import { register } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, null);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50/50">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">إنشاء حساب جديد</CardTitle>
          <CardDescription>أدخل بياناتك للانضمام إلى IBEX</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-700 font-semibold">الاسم الكامل</Label>
              <Input id="fullName" name="fullName" placeholder="الاسم" required className="bg-white" />
              {state?.errors?.fullName && (
                <p className="text-sm text-red-500">{state.errors.fullName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-semibold">رقم الهاتف</Label>
              <Input
                id="phone"
                type="tel"
                name="phone"
                placeholder="0770000000"
                required
                className="text-right bg-white dir-ltr"
              />
              {state?.errors?.phone && (
                <p className="text-sm text-red-500">{state.errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-700 font-semibold">نوع الحساب</Label>
              <Select name="role" required defaultValue="customer">
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="اختر نوع الحساب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merchant">تاجر (صاحب متجر)</SelectItem>
                  <SelectItem value="customer">عميل (زبون)</SelectItem>
                </SelectContent>
              </Select>
               {state?.errors?.role && (
                <p className="text-sm text-red-500">{state.errors.role}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-semibold">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                name="password"
                required
                className="text-right bg-white dir-ltr"
              />
              {state?.errors?.password && (
                <p className="text-sm text-red-500">{state.errors.password}</p>
              )}
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full font-bold" size="lg" disabled={isPending}>
                {isPending ? "جاري الإنشاء..." : "إنشاء حساب"}
              </Button>
            </div>
            
            {state?.message && (
              <p className="text-sm text-red-500 text-center">{state.message}</p>
            )}
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t pt-4">
          <p className="text-sm text-gray-500">
            لديك حساب بالفعل؟ <Link href="/login" className="text-primary font-semibold hover:underline">سجل الدخول</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
