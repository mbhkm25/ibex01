import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCustomerMemberships } from "@/app/actions/membership";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function MembershipCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold"><Skeleton className="h-8 w-24" /></div>
        <Skeleton className="h-4 w-full mt-2" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

async function MembershipsList() {
  const memberships = await getCustomerMemberships();

  if (memberships.length === 0) {
    return (
      <Card className="col-span-full">
        <CardContent className="pt-6 text-center text-gray-500">
          لست مشتركاً في أي متجر بعد. امسح QR Code لأي متجر للانضمام.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {memberships.map((mem) => (
        <Card key={mem.storeId}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              {mem.storeName}
            </CardTitle>
            <Badge variant="outline">نشط</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dir-ltr text-right">
              {Number(mem.currentBalance).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">ر.ي</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              سقف الآجل: {Number(mem.creditLimit).toFixed(2)}
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="secondary">
              <Link href={`/dashboard/customer/store/${mem.storeSlug}`}>
                 عرض التفاصيل
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default async function CustomerDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">لوحة تحكم العميل</h1>
      <Card className="bg-primary/5 border-none shadow-none">
         <CardContent className="pt-6">
            <p className="text-lg">مرحباً، <span className="font-bold">{session.user.name}</span></p>
            <p className="text-sm text-gray-600">هنا يمكنك متابعة أرصدتك ومتاجر المفضلة.</p>
         </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">متاجري</h2>
        <Suspense fallback={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <MembershipCardSkeleton />
                <MembershipCardSkeleton />
                <MembershipCardSkeleton />
            </div>
        }>
          <MembershipsList />
        </Suspense>
      </div>
    </div>
  );
}
