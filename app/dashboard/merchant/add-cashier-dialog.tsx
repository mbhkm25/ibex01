"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";
import { createCashier } from "@/app/actions/cashier";
import { Plus } from "lucide-react";

export function AddCashierDialog() {
  const [isOpen, setIsOpen] = useState(false);
  
    const handleAction = async (prevState: Record<string, unknown> | null, formData: FormData) => {
      const result = await createCashier(prevState, formData);
      if (result.success) {
          setIsOpen(false);
      }
      return result;
  }

  const [state, formAction, isPending] = useActionState(handleAction, null);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="ml-2 h-4 w-4" /> إضافة موظف</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة كاشير جديد</DialogTitle>
          <DialogDescription>
            سيتمكن الكاشير من إجراء عمليات البيع والشحن فقط.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input id="fullName" name="fullName" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف (للدخول)</Label>
                <Input id="phone" name="phone" required className="text-right dir-ltr" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input id="password" name="password" type="password" required className="text-right dir-ltr" />
            </div>

            <DialogFooter>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "جاري الإضافة..." : "إضافة"}
                </Button>
            </DialogFooter>
            {state?.message && <p className="text-red-500 text-sm">{state.message}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}

