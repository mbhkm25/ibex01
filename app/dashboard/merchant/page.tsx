import { auth } from "@/auth";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CreateStoreForm } from "./create-store-form";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStoreCustomers } from "@/app/actions/membership";
import { getStoreProducts } from "@/app/actions/products";
import { getStoreCashiers } from "@/app/actions/cashier"; // New
import { CustomersTable } from "./customers-table";
import { ProductsTable } from "./products-table";
import { CashiersTable } from "./cashiers-table"; // New
import { getMerchantStats, getLast7DaysTransactions, getDebtors } from "@/app/actions/analytics";
import { AnalyticsChart } from "./analytics-chart";
import { DebtorsTable } from "./debtors-table";
import { DollarSign, CreditCard, TrendingDown } from "lucide-react";

export default async function MerchantDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = parseInt(session.user.id!);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userStore = await db.select().from(stores).where(eq(stores.ownerId, userId)).then((res: any) => res[0]);

  if (!userStore) {
    return <CreateStoreForm />;
  }

  const joinLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/join/${userStore.slug}`;
  
  const [customers, products, stats, chartData, debtors, cashiers] = await Promise.all([
      getStoreCustomers(),
      getStoreProducts(userStore.id),
      getMerchantStats(userStore.id),
      getLast7DaysTransactions(userStore.id),
      getDebtors(userStore.id),
      getStoreCashiers(userStore.id)
  ]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">لوحة تحكم التاجر</h1>
        <div className="text-sm text-gray-500">
           متجر: <span className="font-semibold text-black">{userStore.name}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مبيعات اليوم</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(stats?.todaySales || 0).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الديون المعلقة</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{Number(stats?.totalDebts || 0).toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيداعات</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{Number(stats?.totalDeposits || 0).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="customers">العملاء ({customers.length})</TabsTrigger>
          <TabsTrigger value="products">المنتجات ({products.length})</TabsTrigger>
          <TabsTrigger value="debt">المطالبات ({debtors.length})</TabsTrigger>
          <TabsTrigger value="cashiers">الموظفون ({cashiers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <AnalyticsChart data={chartData} />
            <Card className="col-span-3">
               <CardHeader>
                <CardTitle>رمز الانضمام (QR Code)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                   <QRCodeSVG value={joinLink} size={150} />
                </div>
                <p className="text-xs text-gray-500 text-center break-all">
                  <a href={joinLink} className="text-blue-600 hover:underline">رابط الانضمام</a>
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="customers">
          <Card>
             <CardHeader>
                <CardTitle>قائمة العملاء</CardTitle>
             </CardHeader>
             <CardContent>
                <CustomersTable customers={customers} />
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
            <ProductsTable products={products} />
        </TabsContent>

        <TabsContent value="debt">
            <Card>
                <CardHeader>
                    <CardTitle>تعقب الديون</CardTitle>
                </CardHeader>
                <CardContent>
                    <DebtorsTable debtors={debtors} storeName={userStore.name} />
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="cashiers">
             <Card>
                <CardContent className="pt-6">
                    <CashiersTable cashiers={cashiers} />
                </CardContent>
             </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
