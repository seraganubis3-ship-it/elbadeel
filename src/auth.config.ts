import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authConfig = {
  session: { strategy: "jwt" as const, maxAge: 60 * 60 * 24 * 30 },
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("Missing credentials");
            return null;
          }
          
          const parsed = credentialsSchema.safeParse(credentials);
          if (!parsed.success) {
            console.error("Invalid credentials format");
            return null;
          }
          
          const { email, password } = parsed.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            console.error("User not found:", email);
            return null;
          }
          
          if (!user.passwordHash) {
            console.error("User has no password hash");
            return null;
          }
          
          const isValid = await compare(password, user.passwordHash);
          if (!isValid) {
            console.error("Invalid password for:", email);
            return null;
          }
          
          console.log("Auth successful for:", email);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user && token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      // لا توجيه تلقائي - اترك المستخدم في الصفحة الحالية
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // إعادة توجيه الأخطاء للوجين
  },
  debug: false, // إغلاق debug logs
  trustHost: true, // للـ development
};


