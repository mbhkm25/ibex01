"use client";

import { useActionState } from "react";
import { updateSettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsForm({ user }: { user: { fullName: string } }) {
  const [state, formAction, isPending] = useActionState(updateSettings, null);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>تعديل الملف الشخصي</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <Input id="fullName" name="fullName" defaultValue={user.fullName} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور الجديدة (اختياري)</Label>
            <Input id="password" name="password" type="password" placeholder="اتركه فارغاً للإبقاء على الحالية" className="text-right dir-ltr" />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>

          {state?.message && (
             <p className={`text-sm text-center ${state.success ? "text-green-600" : "text-red-500"}`}>
                {state.message}
             </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
