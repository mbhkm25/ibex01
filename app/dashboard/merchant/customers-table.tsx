import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TransactionDialog } from "./transaction-dialog";
import Link from "next/link";

interface Customer {
  id: number;
  membershipId: number;
  fullName: string;
  phone: string;
  currentBalance: string | null;
  status: string | null;
  joinedAt: Date;
}

export function CustomersTable({ customers }: { customers: Customer[] }) {
  if (customers.length === 0) {
    return <div className="text-center p-4 text-gray-500">لا يوجد عملاء منضمين بعد.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">رقم الهاتف</TableHead>
            <TableHead className="text-right">الرصيد الحالي</TableHead>
            <TableHead className="text-right">تاريخ الانضمام</TableHead>
            <TableHead className="text-center">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">
                <Link href={`/dashboard/merchant/customers/${customer.membershipId}`} className="hover:underline text-blue-600">
                    {customer.fullName}
                </Link>
              </TableCell>
              <TableCell className="dir-ltr text-right">{customer.phone}</TableCell>
              <TableCell className="font-bold">
                {Number(customer.currentBalance || 0).toFixed(2)}
              </TableCell>
              <TableCell>
                {new Date(customer.joinedAt).toLocaleDateString("ar-YE")}
              </TableCell>
              <TableCell className="text-center">
                 <TransactionDialog membershipId={customer.membershipId} customerName={customer.fullName} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
