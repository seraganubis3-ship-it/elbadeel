import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

const credentialsSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(4),
  workDate: z.string().optional(), // تاريخ العمل بصيغة DD/MM/YYYY
});

export const authConfig = {
  session: { strategy: 'jwt' as const, maxAge: 60 * 60 * 24 * 30 },
  providers: [
    Credentials({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async credentials => {
        try {
          if (!credentials?.phone || !credentials?.password) {
            return null;
          }

          const parsed = credentialsSchema.safeParse(credentials);
          if (!parsed.success) {
            return null;
          }

          const { phone, password, workDate } = parsed.data;
          const user = await prisma.user.findFirst({
            where: { phone },
            include: { adminRole: true }
          });
          if (!user) {
            return null;
          }

          if (!user.passwordHash) {
            return null;
          }

          const isValid = await compare(password, user.passwordHash);
          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            workDate: workDate || undefined, // تمرير تاريخ العمل إن وُجد
            permissions: user.adminRole?.permissions || [],
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.permissions = user.permissions || [];
        // حفظ تاريخ العمل
        if (
          ((user as any).permissions?.includes('CREATE_ORDER') || 
           (user as any).permissions?.includes('MANAGE_ORDERS') || 
           user.role === 'ADMIN' || 
           user.role === 'STAFF') && 
          user.workDate
        ) {
          token.workDate = user.workDate;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user && token) {
        session.user.id = token.id || token.sub!;
        session.user.role = token.role as string;
        (session.user as any).phone = token.phone;
        (session.user as any).permissions = token.permissions || [];
        // تمرير تاريخ العمل
        if (
          ((token as any).permissions?.includes('CREATE_ORDER') || 
           (token as any).permissions?.includes('MANAGE_ORDERS') || 
           token.role === 'ADMIN' || 
           token.role === 'STAFF') && 
          token.workDate
        ) {
          session.user.workDate = token.workDate;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      if (url.includes('/admin')) {
        return `${baseUrl}/login`;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: false,
  trustHost: true,
};
