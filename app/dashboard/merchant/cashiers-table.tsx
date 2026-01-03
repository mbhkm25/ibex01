"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddCashierDialog } from "./add-cashier-dialog";

interface Cashier {
  id: number;
  fullName: string;
  phone: string;
  createdAt: Date;
}

export function CashiersTable({ cashiers }: { cashiers: Cashier[] }) {
  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">الموظفون</h2>
            <AddCashierDialog />
        </div>
        
        <div className="rounded-md border">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">رقم الهاتف</TableHead>
                <TableHead className="text-right">تاريخ الإضافة</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {cashiers.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                        لا يوجد موظفين.
                    </TableCell>
                </TableRow>
            ) : (
                cashiers.map((c) => (
                <TableRow key={c.id}>
                <TableCell className="font-medium">{c.fullName}</TableCell>
                <TableCell className="dir-ltr text-right">{c.phone}</TableCell>
                <TableCell>{new Date(c.createdAt).toLocaleDateString("ar-YE")}</TableCell>
                </TableRow>
            )))}
            </TableBody>
        </Table>
        </div>
    </div>
  );
}

