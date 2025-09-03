"use client";

import { useState } from "react";
import Button from "@/components/Button";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  wifeName: string | null;
  fatherName: string | null;
  motherName: string | null;
  birthDate: Date | null;
  nationality: string | null;
  idNumber: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProfileFormProps {
  user: User;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    wifeName: user.wifeName || "",
    fatherName: user.fatherName || "",
    motherName: user.motherName || "",
    birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
    nationality: user.nationality || "",
    idNumber: user.idNumber || "",
    address: user.address || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "تم تحديث البروفايل بنجاح" });
        // إعادة تحميل الصفحة بعد ثانيتين
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({ type: "error", text: data.error || "حدث خطأ أثناء تحديث البروفايل" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ في الاتصال" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === "success" 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* الاسم */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            الاسم الكامل *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل اسمك الكامل"
          />
        </div>

        {/* رقم الهاتف */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            رقم الهاتف
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="أدخل رقم هاتفك"
          />
        </div>

        {/* اسم الزوجة */}
        <div>
          <label htmlFor="wifeName" className="block text-sm font-medium text-gray-700 mb-2">
            اسم الزوجة
          </label>
          <input
            type="text"
            id="wifeName"
            name="wifeName"
            value={formData.wifeName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="اسم الزوجة"
          />
        </div>

        {/* اسم الأب */}
        <div>
          <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-2">
            اسم الأب
          </label>
          <input
            type="text"
            id="fatherName"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="اسم الأب"
          />
        </div>

        {/* اسم الأم */}
        <div>
          <label htmlFor="motherName" className="block text-sm font-medium text-gray-700 mb-2">
            اسم الأم
          </label>
          <input
            type="text"
            id="motherName"
            name="motherName"
            value={formData.motherName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="اسم الأم"
          />
        </div>

        {/* تاريخ الميلاد */}
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
            تاريخ الميلاد
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* الجنسية */}
        <div>
          <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">
            الجنسية
          </label>
          <input
            type="text"
            id="nationality"
            name="nationality"
            value={formData.nationality}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="الجنسية"
          />
        </div>

        {/* رقم الهوية */}
        <div>
          <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-2">
            رقم الهوية
          </label>
          <input
            type="text"
            id="idNumber"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="رقم الهوية"
          />
        </div>
      </div>

      {/* العنوان */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          العنوان
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="أدخل عنوانك الكامل"
        />
      </div>

      {/* زر الحفظ */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>
    </form>
  );
}
