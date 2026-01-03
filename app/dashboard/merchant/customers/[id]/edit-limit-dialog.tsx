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
import { updateCreditLimit } from "@/app/actions/membership";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";

export function EditLimitDialog({ membershipId, currentLimit }: { membershipId: number, currentLimit: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [limit, setLimit] = useState(currentLimit);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
        const res = await updateCreditLimit(membershipId, limit);
        if (res.success) {
            setIsOpen(false);
            router.refresh();
        } else {
            alert(res.message);
        }
    } catch (e) {
        alert("Error");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تعديل سقف الائتمان</DialogTitle>
          <DialogDescription>
            تحديد الحد الأقصى للديون المسموح بها لهذا العميل.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="limit">سقف الائتمان الجديد</Label>
            <Input
              id="limit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="text-right dir-ltr"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate} disabled={isLoading}>
             {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

