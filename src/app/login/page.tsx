"use client";

import React, { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [remember, setRemember] = useState(false);
  const callbackUrl = params.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("remember_login");
    if (saved === "true") setRemember(true);
  }, []);

  useEffect(() => {
    const message = params.get('message');
    if (message) {
      setSuccess(decodeURIComponent(message));
    }
  }, [params]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Persist remember preference (session maxAge is configured in auth.config.ts)
      localStorage.setItem("remember_login", remember ? "true" : "false");

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.ok) {
        // Navigate to homepage and refresh to ensure all client comps read updated session
        router.push("/");
        router.refresh();
      } else {
        if ((res as any)?.error === "EMAIL_NOT_VERIFIED") {
          setError("يرجى تأكيد بريدك الإلكتروني أولاً");
        } else if ((res as any)?.error === "ACCOUNT_NOT_VERIFIED") {
          // حساب موجود لكن غير مفعل - توجيه لصفحة تفعيل الحساب
          router.push(`/verify-email?email=${encodeURIComponent(email)}&action=verify_existing`);
        } else {
          setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        }
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-4 bg-gradient-to-br from-green-50 to-blue-50 text-gray-900">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">تسجيل الدخول</h1>
            <p className="text-gray-600">أدخل بياناتك للوصول لحسابك</p>
            {callbackUrl.includes('/service/') && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
                  <strong>ملاحظة:</strong> تحتاج لحساب لطلب هذه الخدمة
                </p>
              </div>
            )}
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center">
              {success}
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
              {error}
              {error === "يرجى تأكيد بريدك الإلكتروني أولاً" && (
                <div className="mt-2">
                  <Link 
                    href={`/verify-email?email=${encodeURIComponent(email)}`} 
                    className="text-green-600 hover:text-green-700 font-medium underline"
                  >
                    إعادة إرسال رسالة التأكيد
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                placeholder="أدخل بريدك الإلكتروني"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                placeholder="أدخل كلمة المرور"
              />
              <div className="mt-2 text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span className="text-sm text-gray-700">تذكرني</span>
              </label>
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              ليس لديك حساب؟{" "}
              <Link href="/register" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">...</div>}>
      <LoginInner />
    </Suspense>
  );
}


