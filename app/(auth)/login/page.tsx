"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50/50">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بياناتك للمتابعة</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
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
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full font-bold" size="lg" disabled={isPending}>
                {isPending ? "جاري الدخول..." : "دخول"}
              </Button>
            </div>
            {errorMessage && (
              <p className="text-sm text-red-500 text-center font-medium bg-red-50 p-2 rounded">{errorMessage}</p>
            )}
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t pt-4">
          <p className="text-sm text-gray-500">
            ليس لديك حساب؟ <Link href="/register" className="text-primary font-semibold hover:underline">أنشئ حساباً جديداً</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
