"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const res = await signIn("credentials", {
      redirect: false,
      phone,
      password,
    } as Record<string, unknown>);

    const typedRes = res as unknown as { error?: string } | undefined;

    if (typedRes && typedRes.error) {
      setErrorMessage(typedRes.error || "فشل تسجيل الدخول");
      setIsLoading(false);
      return;
    }

    // Successful sign-in: redirect to home or dashboard
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50/50">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بياناتك للمتابعة</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-semibold">رقم الهاتف</Label>
              <Input
                id="phone"
                type="tel"
                name="phone"
                placeholder="0770000000"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-right bg-white dir-ltr"
              />
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full font-bold" size="lg" disabled={isLoading}>
                {isLoading ? "جاري الدخول..." : "دخول"}
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
