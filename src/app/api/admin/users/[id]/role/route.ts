import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

// Next.js App Router (v15) expects `params` to be a Promise in the context type
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const params = await ctx.params;
    const session = await getServerSession(authConfig);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const role = String(formData.get("role"));

    if (!role || !["ADMIN", "STAFF", "VIEWER", "USER"].includes(role)) {
      return NextResponse.json({ error: "invalid role" }, { status: 400 });
    }

    await prisma.user.update({ where: { id: params.id }, data: { role: role as any } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Update role error:", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
