"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface Debtor {
  id: number;
  fullName: string;
  phone: string;
  currentBalance: string | null; // will be negative string
}

export function DebtorsTable({ debtors, storeName }: { debtors: Debtor[], storeName: string }) {
  const sendReminder = (debtor: Debtor) => {
    const debtAmount = Math.abs(Number(debtor.currentBalance)).toFixed(2);
    const message = `مرحباً ${debtor.fullName}،\n\nنود تذكيركم بأن لديكم رصيد مستحق بقيمة *${debtAmount}* لدى *${storeName}*.\n\nيرجى التواصل معنا لتسوية الحساب.\nشكراً.`;
    
    // Check if phone starts with country code, if not add Yemen code usually or assume user provided right format.
    // Assuming phone is stored as user entered (e.g. 077...) or international.
    // For WA, best to strip leading 0 and add code if missing, but let's assume it works or user edits.
    // Better: if starts with 0, replace with 967.
    let phone = debtor.phone.replace(/\D/g, ''); // strip non-digits
    if (phone.startsWith('0')) phone = '967' + phone.substring(1);
    else if (phone.startsWith('7')) phone = '967' + phone;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (debtors.length === 0) {
      return <div className="text-center py-10 text-gray-500">لا توجد مطالبات معلقة.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">رقم الهاتف</TableHead>
            <TableHead className="text-right">الديون المستحقة</TableHead>
            <TableHead className="text-center">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {debtors.map((debtor) => (
            <TableRow key={debtor.id}>
              <TableCell className="font-medium">{debtor.fullName}</TableCell>
              <TableCell className="dir-ltr text-right">{debtor.phone}</TableCell>
              <TableCell className="font-bold text-red-600 dir-ltr text-right">
                {Math.abs(Number(debtor.currentBalance)).toFixed(2)}
              </TableCell>
              <TableCell className="text-center">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => sendReminder(debtor)}
                >
                  <MessageCircle className="h-4 w-4" />
                  تذكير واتساب
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

