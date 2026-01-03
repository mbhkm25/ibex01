"use client";

import { useActionState } from "react";
import { createStore } from "@/app/actions/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CreateStoreForm() {
  const [state, formAction, isPending] = useActionState(createStore, null);

  return (
    <Card className="w-full max-w-lg mx-auto mt-10">
      <CardHeader>
        <CardTitle>إنشاء متجرك</CardTitle>
        <CardDescription>قم بإعداد متجرك للبدء في استقبال العملاء.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم المتجر</Label>
            <Input id="name" name="name" placeholder="مثال: بقالة السعادة" required />
            {state?.errors?.name && (
              <p className="text-sm text-red-500">{state.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف المتجر (اختياري)</Label>
            <Input id="description" name="description" placeholder="وصف قصير للمتجر" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">رقم الواتساب للطلبات</Label>
            <Input
              id="whatsappNumber"
              name="whatsappNumber"
              placeholder="0770000000"
              required
              className="text-right"
              dir="ltr"
            />
             {state?.errors?.whatsappNumber && (
              <p className="text-sm text-red-500">{state.errors.whatsappNumber}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "جاري الإنشاء..." : "إنشاء المتجر"}
          </Button>

          {state?.message && (
            <p className="text-sm text-red-500 text-center">{state.message}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

