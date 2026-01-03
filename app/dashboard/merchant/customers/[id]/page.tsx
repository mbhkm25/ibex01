import { auth } from "@/auth";
import { db } from "@/db";
import { storeMemberships, users, transactions, stores } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TransactionDialog } from "../../transaction-dialog";
import { EditLimitDialog } from "./edit-limit-dialog";

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const membershipId = parseInt(id);
  const merchantId = parseInt(session.user.id);

  // Fetch membership details and verify ownership
  const membershipRes = await db
    .select({
      id: storeMemberships.id,
      currentBalance: storeMemberships.currentBalance,
      creditLimit: storeMemberships.creditLimit,
      joinedAt: storeMemberships.joinedAt,
      status: storeMemberships.status,
      userId: users.id,
      fullName: users.fullName,
      phone: users.phone,
      storeOwnerId: stores.ownerId
    })
    .from(storeMemberships)
    .innerJoin(users, eq(storeMemberships.userId, users.id))
    .innerJoin(stores, eq(storeMemberships.storeId, stores.id))
    .where(eq(storeMemberships.id, membershipId))
    ;

  const membership = membershipRes[0];

  if (!membership) {
    notFound();
  }

  if (membership.storeOwnerId !== merchantId) {
     return <div className="p-6 text-red-500">غير مصرح لك بالوصول لهذا العميل.</div>;
  }

  // Fetch transactions
  const transactionHistory = await db
    .select()
    .from(transactions)
    .where(eq(transactions.membershipId, membershipId))
    .orderBy(desc(transactions.createdAt));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">تفاصيل العميل: {membership.fullName}</h1>
        <TransactionDialog membershipId={membership.id} customerName={membership.fullName} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
           <CardHeader>
             <CardTitle className="text-sm text-gray-500">الرصيد الحالي</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{Number(membership.currentBalance).toFixed(2)}</div>
           </CardContent>
        </Card>
         <Card>
           <CardHeader>
             <div className="flex justify-between items-center">
                <CardTitle className="text-sm text-gray-500">سقف الائتمان (الآجل)</CardTitle>
                <EditLimitDialog membershipId={membership.id} currentLimit={membership.creditLimit} />
             </div>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{Number(membership.creditLimit).toFixed(2)}</div>
           </CardContent>
        </Card>
         <Card>
           <CardHeader>
             <CardTitle className="text-sm text-gray-500">معلومات الاتصال</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="font-medium">{membership.phone}</div>
             <div className="text-sm text-gray-500">انضم في: {new Date(membership.joinedAt).toLocaleDateString("ar-YE")}</div>
           </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل العمليات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">نوع العملية</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الرصيد بعد</TableHead>
                <TableHead className="text-right">ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionHistory.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">لا توجد عمليات سابقة.</TableCell>
                 </TableRow>
              ) : (
                transactionHistory.map((tx: { id: number; createdAt: string; type: string; amount: string; balanceAfter: string; note?: string }) => (
                  <TableRow key={tx.id}>
                    <TableCell>{new Date(tx.createdAt).toLocaleString("ar-YE")}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === "deposit" ? "default" : (tx.type === "purchase" ? "destructive" : "secondary")}>
                        {tx.type === "deposit" ? "إيداع" : (tx.type === "purchase" ? "شراء" : "تسديد")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold dir-ltr text-right">{Number(tx.amount).toFixed(2)}</TableCell>
                    <TableCell className="dir-ltr text-right">{Number(tx.balanceAfter).toFixed(2)}</TableCell>
                    <TableCell>{tx.note || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
