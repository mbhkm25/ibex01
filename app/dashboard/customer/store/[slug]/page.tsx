import { auth } from "@/auth";
import { db } from "@/db";
import { storeMemberships, transactions, stores, products } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StoreView } from "./store-view";

export default async function CustomerStoreDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { slug } = await params;
  const userId = parseInt(session.user.id);

  // Fetch store and membership details
  const membershipRes = await db
    .select({
      id: storeMemberships.id,
      storeId: stores.id,
      currentBalance: storeMemberships.currentBalance,
      creditLimit: storeMemberships.creditLimit,
      joinedAt: storeMemberships.joinedAt,
      storeName: stores.name,
      storeDescription: stores.description,
      storePhone: stores.whatsappNumber
    })
    .from(storeMemberships)
    .innerJoin(stores, eq(storeMemberships.storeId, stores.id))
    .where(
        and(
            eq(storeMemberships.userId, userId),
            eq(stores.slug, slug)
        )
    )
    ;

  const membership = membershipRes[0];

  if (!membership) {
    notFound();
  }

  // Fetch transactions
  const transactionHistory = await db
    .select()
    .from(transactions)
    .where(eq(transactions.membershipId, membership.id))
    .orderBy(desc(transactions.createdAt))
    .limit(5); // Show only last 5 transactions here

  // Fetch products
  const storeProducts = await db
    .select()
    .from(products)
    .where(eq(products.storeId, membership.storeId))
    .orderBy(desc(products.id));

  return (
    <div className="container mx-auto p-6 space-y-8 pb-24">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{membership.storeName}</h1>
        <p className="text-gray-500">{membership.storeDescription}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-green-100 bg-green-50/50">
           <CardHeader>
             <CardTitle className="text-sm text-gray-500">رصيدك المتاح</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-3xl font-bold text-green-700 dir-ltr text-right">{Number(membership.currentBalance).toFixed(2)}</div>
           </CardContent>
        </Card>
         <Card>
           <CardHeader>
             <CardTitle className="text-sm text-gray-500">سقف الائتمان (الآجل)</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-2xl font-bold">{Number(membership.creditLimit).toFixed(2)}</div>
           </CardContent>
        </Card>
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">المنتجات</h2>
        <StoreView 
            products={storeProducts} 
            whatsappNumber={membership.storePhone || ""} 
            customerName={session.user.name || "عميل"} 
        />
      </div>

      <div className="pt-8 border-t">
        <h2 className="text-lg font-bold mb-4 text-gray-500">آخر العمليات</h2>
         <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">نوع العملية</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionHistory.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">لا توجد عمليات سابقة.</TableCell>
                 </TableRow>
              ) : (
                transactionHistory.map((tx: { id: number; createdAt: string; type: string; amount: string }) => (
                  <TableRow key={tx.id}>
                    <TableCell>{new Date(tx.createdAt).toLocaleDateString("ar-YE")}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === "deposit" ? "default" : (tx.type === "purchase" ? "destructive" : "secondary")}>
                        {tx.type === "deposit" ? "إيداع" : (tx.type === "purchase" ? "شراء" : "تسديد")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold dir-ltr text-right">{Number(tx.amount).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </div>
    </div>
  );
}
