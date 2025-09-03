"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PaymentFormProps {
  orderId: string;
  totalAmount: number;
}

export default function PaymentForm({ orderId, totalAmount }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<"VODAFONE_CASH" | "INSTA_PAY" | null>(null);
  const [senderPhone, setSenderPhone] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // أرقام الدفع الفعلية (يمكن تغييرها حسب الحاجة)
  const PAYMENT_NUMBERS = {
    VODAFONE_CASH: "01012345678",
    INSTA_PAY: "01087654321"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentMethod) {
      setError("يرجى اختيار طريقة الدفع");
      return;
    }
    
    if (!senderPhone.trim()) {
      setError("يرجى إدخال رقم الهاتف المحول منه");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      // Handle file upload first if screenshot is provided
      let screenshotPath = "";
      if (paymentScreenshot) {
        const formData = new FormData();
        formData.append("file", paymentScreenshot);
        
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          screenshotPath = uploadResult.filePath;
        }
      }
      
      // Submit payment
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: paymentMethod,
          senderPhone,
          paymentScreenshot: screenshotPath,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Redirect to success page
        router.push(`/order-success?orderId=${orderId}&paymentSubmitted=true`);
      } else {
        setError(result.error || "حدث خطأ أثناء إرسال بيانات الدفع");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setError("حدث خطأ أثناء إرسال بيانات الدفع");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPaymentScreenshot(file);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">طريقة الدفع</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            اختر طريقة الدفع *
          </label>
          
          {/* Vodafone Cash */}
          <div 
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
              paymentMethod === "VODAFONE_CASH"
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300 bg-gray-50'
            }`}
            onClick={() => setPaymentMethod("VODAFONE_CASH")}
          >
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-all duration-300 ${
                paymentMethod === "VODAFONE_CASH"
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300'
              }`}>
                {paymentMethod === "VODAFONE_CASH" && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">فودافون كاش</h4>
                <p className="text-sm text-gray-600">ادفع عبر فودافون كاش</p>
              </div>
            </div>
          </div>

          {/* Insta Pay */}
          <div 
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
              paymentMethod === "INSTA_PAY"
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300 bg-gray-50'
            }`}
            onClick={() => setPaymentMethod("INSTA_PAY")}
          >
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-all duration-300 ${
                paymentMethod === "INSTA_PAY"
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300'
              }`}>
                {paymentMethod === "INSTA_PAY" && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">انستا باي</h4>
                <p className="text-sm text-gray-600">ادفع عبر انستا باي</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        {paymentMethod && (
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">تعليمات الدفع</h4>
            
            {paymentMethod === "VODAFONE_CASH" ? (
              <div className="space-y-3 text-sm text-blue-800">
                <p>1. قم بتحويل المبلغ {(totalAmount / 100).toFixed(2)} جنيه إلى رقم فودافون كاش:</p>
                <div className="bg-white rounded-lg p-3 border border-blue-300">
                  <p className="font-mono text-lg font-bold text-center text-blue-600">{PAYMENT_NUMBERS.VODAFONE_CASH}</p>
                </div>
                <p>2. احتفظ بسكرين شوت للتحويل</p>
                <p>3. أدخل رقم الهاتف المحول منه</p>
                <p>4. ارفع سكرين شوت التحويل</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                  <p className="text-yellow-800 text-xs font-medium">
                    ⚠️ تنبيه: يجب إتمام الدفع خلال 30 دقيقة وإلا سيتم إلغاء الطلب تلقائياً
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-blue-800">
                <p>1. قم بتحويل المبلغ {(totalAmount / 100).toFixed(2)} جنيه عبر انستا باي إلى:</p>
                <div className="bg-white rounded-lg p-3 border border-blue-300">
                  <p className="font-mono text-lg font-bold text-center text-blue-600">{PAYMENT_NUMBERS.INSTA_PAY}</p>
                </div>
                <p>2. احتفظ بسكرين شوت للتحويل</p>
                <p>3. أدخل رقم الهاتف المحول منه</p>
                <p>4. ارفع سكرين شوت التحويل</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                  <p className="text-yellow-800 text-xs font-medium">
                    ⚠️ تنبيه: يجب إتمام الدفع خلال 30 دقيقة وإلا سيتم إلغاء الطلب تلقائياً
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sender Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم الهاتف المحول منه *
          </label>
          <input
            type="tel"
            value={senderPhone}
            onChange={(e) => setSenderPhone(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            placeholder="01xxxxxxxxx"
          />
        </div>

        {/* Payment Screenshot Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            سكرين شوت التحويل
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
          />
          <p className="text-xs text-gray-500 mt-1">
            يمكنك رفع صورة أو ملف PDF لسكرين شوت التحويل
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !paymentMethod || !senderPhone.trim()}
          className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
            isSubmitting || !paymentMethod || !senderPhone.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جاري الإرسال...
            </>
          ) : (
            'إرسال بيانات الدفع'
          )}
        </button>
      </form>
    </div>
  );
}
