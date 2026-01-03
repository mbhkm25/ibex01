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
import { Textarea } from "@/components/ui/textarea"; 
import { Switch } from "@/components/ui/switch"; 
import { upsertProduct } from "@/app/actions/products";
import { useActionState } from "react";
import { Plus, Edit } from "lucide-react";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Product {
  id: number;
  name: string;
  price: string;
  description: string | null;
  isAvailable: boolean;
}

export function ProductDialog({ product }: { product?: Product }) {
  const [isOpen, setIsOpen] = useState(false);
  
    const handleAction = async (prevState: Record<string, unknown> | null, formData: FormData) => {
      const result = await upsertProduct(prevState, formData);
      if (result.success) {
          setIsOpen(false);
      }
      return result;
  }

  const [state, formAction, isPending] = useActionState(handleAction, null);
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {product ? (
            <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
        ) : (
            <Button><Plus className="ml-2 h-4 w-4" /> إضافة منتج</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
          <DialogDescription>
            أدخل تفاصيل المنتج أدناه.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
            {product && <input type="hidden" name="id" value={product.id} />}
            
            <div className="space-y-2">
                <Label htmlFor="name">اسم المنتج</Label>
                <Input id="name" name="name" defaultValue={product?.name} required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="price">السعر</Label>
                <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price} required className="text-right dir-ltr" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea id="description" name="description" defaultValue={product?.description || ""} />
            </div>

             <div className="flex items-center space-x-2 space-x-reverse">
                <input type="hidden" name="isAvailable" value={isAvailable.toString()} />
                <Switch 
                    id="isAvailable" 
                    checked={isAvailable}
                    onCheckedChange={setIsAvailable}
                />
                <Label htmlFor="isAvailable">متوفر للبيع</Label>
            </div>

            <DialogFooter>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "جاري الحفظ..." : "حفظ"}
                </Button>
            </DialogFooter>
            {state?.message && <p className="text-red-500 text-sm">{state.message}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}
