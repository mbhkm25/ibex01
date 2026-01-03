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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { processTransaction } from "@/app/actions/transactions";
import { useRouter } from "next/navigation";
import { ReceiptDialog } from "./receipt-dialog"; // Create this next

interface TransactionDialogProps {
  membershipId: number;
  customerName: string;
}

export function TransactionDialog({ membershipId, customerName }: TransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [receiptData, setReceiptData] = useState<{
    transactionId: number;
    date: Date;
    amount: string;
    type: "purchase" | "deposit";
    storeName: string;
    balanceAfter: string;
  } | null>(null); // For success receipt
  const router = useRouter();

  const handleTransaction = async (type: "purchase" | "deposit") => {
    setIsLoading(true);
    setMessage("");

    try {
      const result = await processTransaction(membershipId, type, amount, note);
      if ("success" in result && result.success) {
        setAmount("");
        setNote("");
        setReceiptData(result.data); // Save receipt data
        router.refresh();
      } else {
        setMessage((result as { message?: string }).message || "حدث خطأ");
      }
    } catch {
      setMessage("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };
  
  // If receipt data exists, show ReceiptDialog instead
  if (receiptData) {
      return (
          <ReceiptDialog 
            data={receiptData} 
            customerName={customerName} 
            onClose={() => { setReceiptData(null); setIsOpen(false); }} 
          />
      );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">إدارة الحساب</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إدارة حساب: {customerName}</DialogTitle>
          <DialogDescription>
            قم بإجراء عمليات مالية لهذا العميل.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="purchase" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="purchase">شراء (خصم)</TabsTrigger>
            <TabsTrigger value="deposit">إيداع (شحن)</TabsTrigger>
          </TabsList>
          
          <div className="space-y-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="amount">المبلغ</Label>
                <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-right dir-ltr"
                    step="0.01"
                    min="0"
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="note">ملاحظة (اختياري)</Label>
                <Input 
                    id="note" 
                    placeholder="تفاصيل العملية..." 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
             </div>
             
             {message && <p className="text-sm text-red-500">{message}</p>}
          </div>

          <TabsContent value="purchase">
            <DialogFooter>
              <Button onClick={() => handleTransaction("purchase")} disabled={isLoading || !amount} variant="destructive">
                 {isLoading ? "جاري المعالجة..." : "تأكيد عملية الشراء"}
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="deposit">
            <DialogFooter>
               <Button onClick={() => handleTransaction("deposit")} disabled={isLoading || !amount}>
                 {isLoading ? "جاري المعالجة..." : "تأكيد الإيداع"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
