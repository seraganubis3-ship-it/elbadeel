import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function AdminFaqs() {
  const session = await requireAdmin();
  const faqs = await prisma.fAQ.findMany({ orderBy: { orderIndex: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">الأسئلة الشائعة</h1>
      <div className="space-y-2">
        {faqs.map((f: { id: string; question: string; answer: string; orderIndex: number; active: boolean }) => (
          <div key={f.id} className="border rounded p-3">
            <div className="font-medium">{f.question}</div>
            <div className="text-sm text-gray-700">{f.answer}</div>
            <div className="text-xs text-gray-500 mt-1">ترتيب: {f.orderIndex} • {f.active ? "نشط" : "غير نشط"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


