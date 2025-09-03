import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import PaymentForm from "./PaymentForm";

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;

  // Get order
  const order = await prisma.order.findUnique({
    where: { id },
    include: { 
      service: true, 
      variant: true,
      payment: true 
    },
  });

  if (!order) return notFound();

  // Check if user owns this order
  if (order.userId !== session.user.id) {
    redirect("/orders");
  }

  // Check if order is pending
  if (order.status !== "PENDING") {
    redirect(`/orders/${id}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">إتمام الدفع</h1>
          <p className="text-lg text-gray-600">اختر طريقة الدفع المناسبة لك</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">ملخص الطلب</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">الخدمة:</span>
                  <span className="font-medium text-gray-900">{order.service.name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">النوع:</span>
                  <span className="font-medium text-gray-900">{order.variant.name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">سعر الخدمة:</span>
                  <span className="font-medium text-gray-900">
                    {(order.variant.priceCents / 100).toFixed(2)} جنيه
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">التوصيل:</span>
                  <span className="font-medium text-gray-900">
                    {order.deliveryType === "OFFICE" ? "استلام من المكتب" : "توصيل على العنوان"}
                  </span>
                </div>
                
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">رسوم التوصيل:</span>
                    <span className="font-medium text-gray-900">
                      {(order.deliveryFee / 100).toFixed(2)} جنيه
                    </span>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">الإجمالي:</span>
                    <span className="text-xl font-bold text-green-600">
                      {(order.totalCents / 100).toFixed(2)} جنيه
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <PaymentForm orderId={order.id} totalAmount={order.totalCents} />
          </div>
        </div>
      </div>
    </div>
  );
}
