import { db } from "@/db";
import { stores, storeMemberships } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { JoinButton } from "./join-button";

export default async function JoinStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await db.select().from(stores).where(eq(stores.slug, slug)).then(res => res[0]);

  if (!store) {
    notFound();
  }

  const session = await auth();
  
  if (!session?.user?.id) {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
             <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">انضم إلى {store.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-6 text-gray-600">{store.description || "لا يوجد وصف"}</p>
                    <Button asChild className="w-full" size="lg">
                        <a href={`/login?callbackUrl=/join/${slug}`}>تسجيل الدخول للانضمام</a>
                    </Button>
                </CardContent>
             </Card>
        </div>
    );
  }
  
  // Check if already a member
  const userId = parseInt(session.user.id);
  const existingMembership = await db
    .select()
    .from(storeMemberships)
    .where(
      and(
        eq(storeMemberships.userId, userId),
        eq(storeMemberships.storeId, store.id)
      )
    )
    .then((res) => res[0]);

  if (existingMembership) {
      redirect("/dashboard/customer");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{store.name}</CardTitle>
          <CardDescription className="text-lg mt-2">{store.description}</CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-green-600 font-medium mb-6">
               أنت على وشك الانضمام لهذا المتجر وتفعيل حسابك المالي.
           </p>
           <JoinButton storeId={store.id} />
        </CardContent>
      </Card>
    </div>
  );
}
