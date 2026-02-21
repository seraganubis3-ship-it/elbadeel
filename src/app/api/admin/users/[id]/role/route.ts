import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';

// Next.js App Router (v15) expects `params` to be a Promise in the context type
export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const { id } = ctx.params;
    const session = await getServerSession(authConfig);
    const userRole = session?.user?.role;
    // Fallback: Check if user is an ADMIN or has permission
    if (!session?.user || (userRole !== 'ADMIN' && !hasPermission(session.user as any, 'MANAGE_USERS'))) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const role = String(formData.get('role'));
    const adminRoleId = formData.get('adminRoleId') as string | null;

    if (!role || !['ADMIN', 'STAFF', 'VIEWER', 'USER'].includes(role)) {
      return NextResponse.json({ error: 'invalid role' }, { status: 400 });
    }

    await prisma.user.update({ 
      where: { id }, 
      data: { 
        role: role as any,
        adminRoleId: adminRoleId || null
      } 
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
