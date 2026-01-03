import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { LoginFormSchema } from "./lib/definitions";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  secret: "7956b272e34d4fcd406458ce6d68278034e37bbc76727721af93164e0edc540a",
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log("Authorize called with:", credentials?.phone);

        const parsedCredentials = LoginFormSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { phone, password } = parsedCredentials.data;
          
          try {
            const userRes = await db.select().from(users).where(eq(users.phone, phone));
            const user = userRes[0];

            if (!user) {
                console.log("User not found");
                return null;
            }
            
            const passwordsMatch = await bcrypt.compare(password, user.password);
            
            if (passwordsMatch) {
                console.log("Password match");
                return {
                    id: String(user.id),
                    name: user.fullName,
                    role: user.role,
                };
            }
            console.log("Password mismatch");
          } catch (error) {
              console.error("Auth error:", error);
          }
        }
        return null;
      },
    }),
  ],
});
