"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const action = searchParams.get("action");
  const userId = searchParams.get("userId");
  
  // تحديد نوع الصفحة
  const isVerifyingExisting = action === "verify_existing";
  
  const [formData, setFormData] = useState({
    code: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/register");
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 6 digits
    if (/^\d{0,6}$/.test(value)) {
      setFormData({ code: value });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.code.length !== 6) {
      setError("يرجى إدخال الكود المكون من 6 أرقام");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: formData.code,
          userId, // إرسال معرف المستخدم إذا كان متوفراً
          action, // إرسال نوع العملية
        }),
      });

      if (res.ok) {
        setSuccess("تم تأكيد البريد الإلكتروني بنجاح!");
        setTimeout(() => {
          router.push("/login?message=تم تأكيد الحساب بنجاح");
        }, 2000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "فشل في تأكيد الكود");
      }
    } catch (err) {
      setError("حدث خطأ. حاول مرة أخرى");
    }

    setLoading(false);
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email,
          userId, // إرسال معرف المستخدم إذا كان متوفراً
          action, // إرسال نوع العملية
        }),
      });

      if (res.ok) {
        setTimeLeft(600);
        setCanResend(false);
        setSuccess("تم إرسال كود جديد إلى بريدك الإلكتروني");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "فشل في إرسال الكود");
      }
    } catch (err) {
      setError("حدث خطأ. حاول مرة أخرى");
    }

    setLoading(false);
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-4 bg-gradient-to-br from-green-50 to-blue-50 text-gray-900">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {isVerifyingExisting ? "تفعيل الحساب الموجود" : "تأكيد البريد الإلكتروني"}
            </h1>
            <p className="text-gray-600 mb-4">
              {isVerifyingExisting 
                ? "تم إرسال كود التفعيل إلى بريدك الإلكتروني لتفعيل الحساب الموجود:"
                : "تم إرسال كود التفعيل إلى:"
              }
            </p>
            <p className="text-green-600 font-semibold text-lg">{email}</p>
            
            {/* رسالة خاصة للحسابات الموجودة */}
            {isVerifyingExisting && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
                  <strong>ملاحظة:</strong> لا تحتاج لإنشاء حساب جديد. فقط قم بتفعيل الحساب الموجود.
                </p>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                <strong>كيفية التفعيل:</strong>
              </p>
              <ol className="text-blue-700 text-sm text-right mt-2 space-y-1">
                <li>1. تحقق من بريدك الإلكتروني</li>
                <li>2. انسخ الكود المكون من 6 أرقام</li>
                <li>3. أدخل الكود في الحقل أدناه</li>
                <li>4. اضغط على "تأكيد الحساب"</li>
              </ol>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كود التفعيل
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-center text-2xl font-mono tracking-widest text-black"
                placeholder="000000"
                autoComplete="off"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                أدخل الكود المكون من 6 أرقام
              </p>
            </div>

            {/* Timer */}
            <div className="text-center">
              {timeLeft > 0 ? (
                <div className="text-sm text-gray-600">
                  الوقت المتبقي: <span className="font-mono text-red-600">{formatTime(timeLeft)}</span>
                </div>
              ) : (
                <div className="text-sm text-red-600">
                  انتهت صلاحية الكود
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || timeLeft === 0}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {loading ? "جاري التحقق..." : "تأكيد الحساب"}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            {canResend ? (
              <button
                onClick={handleResendCode}
                disabled={loading}
                className="text-green-600 hover:text-green-700 font-semibold transition-colors disabled:opacity-50"
              >
                إرسال كود جديد
              </button>
            ) : (
              <p className="text-gray-500 text-sm">
                لم تستلم الكود؟ انتظر {formatTime(timeLeft)} لإرسال كود جديد
              </p>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
