"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ReceiptData {
  transactionId: number;
  date: Date;
  amount: string;
  type: "purchase" | "deposit";
  storeName: string;
  balanceAfter: string;
}

export function ReceiptDialog({ 
    data, 
    customerName, 
    onClose 
}: { 
    data: ReceiptData, 
    customerName: string, 
    onClose: () => void 
}) {
  const shareReceipt = () => {
    // Basic text sharing for now, could be image link later
    const dateStr = new Date(data.date).toLocaleString("ar-YE");
    const typeStr = data.type === "purchase" ? "شراء" : "إيداع";
    const amountStr = Number(data.amount).toFixed(2);
    const balanceStr = Number(data.balanceAfter).toFixed(2);

    const message = `*${data.storeName} - إيصال عملية*\n\n` +
      `نوع العملية: ${typeStr}\n` +
      `المبلغ: ${amountStr}\n` +
      `التاريخ: ${dateStr}\n` +
      `العميل: ${customerName}\n` +
      `الرصيد الحالي: ${balanceStr}\n\n` +
      `رقم العملية: #${data.transactionId}`;

    if (navigator.share) {
        navigator.share({
            title: `إيصال - ${data.storeName}`,
            text: message
        }).catch(console.error);
    } else {
        // Fallback to clipboard or simple alert
        navigator.clipboard.writeText(message).then(() => alert("تم نسخ الإيصال"));
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-center text-xl">تمت العملية بنجاح</DialogTitle>
          <DialogDescription className="text-center">
            تفاصيل العملية مسجلة أدناه.
          </DialogDescription>
        </DialogHeader>
        
        <Card className="p-6 bg-gray-50 border-dashed border-2 border-gray-200 shadow-none">
            <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-500">المتجر:</span>
                    <span className="font-semibold">{data.storeName}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">العميل:</span>
                    <span className="font-semibold">{customerName}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">نوع العملية:</span>
                    <span className="font-semibold">{data.type === "purchase" ? "شراء" : "إيداع"}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">المبلغ:</span>
                    <span className="font-bold text-lg dir-ltr">{Number(data.amount).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-300 my-2 pt-2 flex justify-between">
                    <span className="text-gray-500">الرصيد بعد:</span>
                    <span className="font-bold dir-ltr">{Number(data.balanceAfter).toFixed(2)}</span>
                </div>
                <div className="text-center text-xs text-gray-400 mt-4">
                    رقم العملية: #{data.transactionId} | {new Date(data.date).toLocaleTimeString("ar-YE")}
                </div>
            </div>
        </Card>

        <div className="flex gap-2 mt-4">
            <Button className="flex-1" variant="outline" onClick={shareReceipt}>
                <Share2 className="mr-2 h-4 w-4" /> مشاركة / نسخ
            </Button>
            <Button className="flex-1" onClick={onClose}>
                إغلاق
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

