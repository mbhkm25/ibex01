import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { getStoreCustomers } from "@/app/actions/membership";
import { CustomersTable } from "../merchant/customers-table";

export default async function CashierDashboard({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const session = await auth();

  if (!session?.user || (session.user as { role?: string }).role !== "cashier") {
    redirect("/login");
  }

  const { q } = await searchParams;
  const query = (q || "").toLowerCase();

  const allCustomers = await getStoreCustomers();
  
  const filteredCustomers = query 
    ? allCustomers.filter((c: { fullName: string; phone: string }) => 
        c.fullName.toLowerCase().includes(query) || 
        c.phone.includes(query)
      ) 
    : allCustomers;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">لوحة الكاشير</h1>
      
      <Card>
        <CardHeader>
           <CardTitle>بحث عن عميل</CardTitle>
        </CardHeader>
        <CardContent>
            <form className="flex gap-2">
                <Input name="q" placeholder="ابحث بالاسم أو رقم الهاتف..." defaultValue={query} />
                <Button type="submit">
                    <Search className="h-4 w-4" />
                </Button>
            </form>
        </CardContent>
      </Card>

      <Card>
         <CardContent className="pt-6">
             <CustomersTable customers={filteredCustomers} />
         </CardContent>
      </Card>
    </div>
  );
}
