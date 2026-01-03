import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = parseInt(session.user.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = await db.select().from(users).where(eq(users.id, userId)).then((res: any) => res[0]);

  if (!user) return null;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">الإعدادات</h1>
      <SettingsForm user={user} />
    </div>
  );
}

