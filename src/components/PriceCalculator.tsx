"use client";

import { useState, useEffect } from "react";

interface PriceCalculatorProps {
  basePrice: number;
  variantName: string;
  etaDays: number;
  onPriceChange?: (finalPrice: number) => void;
}

interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  isActive: boolean;
}

export default function PriceCalculator({ 
  basePrice, 
  variantName, 
  etaDays, 
  onPriceChange 
}: PriceCalculatorProps) {
  const [discounts] = useState<Discount[]>([
    {
      id: 'first-order',
      name: 'خصم العميل الجديد',
      type: 'percentage',
      value: 10,
      description: 'خصم 10% للعملاء الجدد',
      isActive: true
    },
    {
      id: 'bulk-order',
      name: 'خصم الطلبات المتعددة',
      type: 'percentage',
      value: 5,
      description: 'خصم 5% للطلبات المتعددة',
      isActive: false
    },
    {
      id: 'urgent',
      name: 'رسوم الاستعجال',
      type: 'percentage',
      value: 15,
      description: 'رسوم إضافية 15% للخدمة السريعة',
      isActive: false
    }
  ]);

  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);

  const calculateFinalPrice = () => {
    let finalPrice = basePrice;
    let appliedDiscounts: string[] = [];

    // Apply percentage discounts
    discounts.forEach(discount => {
      if (discount.isActive && selectedDiscounts.includes(discount.id)) {
        if (discount.type === 'percentage') {
          finalPrice -= (finalPrice * discount.value / 100);
          appliedDiscounts.push(`${discount.name}: -${discount.value}%`);
        } else {
          finalPrice -= discount.value;
          appliedDiscounts.push(`${discount.name}: -${discount.value} جنيه`);
        }
      }
    });

    // Apply urgent fee if selected
    if (isUrgent) {
      const urgentDiscount = discounts.find(d => d.id === 'urgent');
      if (urgentDiscount) {
        finalPrice += (finalPrice * urgentDiscount.value / 100);
        appliedDiscounts.push(`${urgentDiscount.name}: +${urgentDiscount.value}%`);
      }
    }

    return {
      finalPrice: Math.max(0, finalPrice),
      appliedDiscounts,
      totalDiscount: basePrice - Math.max(0, finalPrice)
    };
  };

  const { finalPrice, appliedDiscounts, totalDiscount } = calculateFinalPrice();

  useEffect(() => {
    onPriceChange?.(finalPrice);
  }, [finalPrice, onPriceChange]);

  const toggleDiscount = (discountId: string) => {
    setSelectedDiscounts(prev => 
      prev.includes(discountId) 
        ? prev.filter(id => id !== discountId)
        : [...prev, discountId]
    );
  };

  const toggleUrgent = () => {
    setIsUrgent(!isUrgent);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">حاسبة السعر</h3>
        <p className="text-gray-600 text-sm">احسب السعر النهائي مع الخصومات</p>
      </div>

      {/* Base Price Display */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-green-900">السعر الأساسي</h4>
            <p className="text-sm text-green-700">{variantName}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {basePrice.toFixed(2)} جنيه
            </div>
            <div className="text-xs text-green-600">المدة: {etaDays} يوم</div>
          </div>
        </div>
      </div>

      {/* Available Discounts */}
      <div className="space-y-3 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">الخصومات المتاحة</h4>
        
        {discounts.filter(d => d.isActive).map((discount) => (
          <div key={discount.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3 space-x-reverse">
              <input
                type="checkbox"
                id={discount.id}
                checked={selectedDiscounts.includes(discount.id)}
                onChange={() => toggleDiscount(discount.id)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <div>
                <label htmlFor={discount.id} className="font-medium text-gray-900 text-sm cursor-pointer">
                  {discount.name}
                </label>
                <p className="text-xs text-gray-600">{discount.description}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-sm font-medium ${
                discount.type === 'percentage' ? 'text-blue-600' : 'text-green-600'
              }`}>
                {discount.type === 'percentage' ? `-${discount.value}%` : `-${discount.value} جنيه`}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Urgent Service Option */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="flex items-center space-x-3 space-x-reverse">
            <input
              type="checkbox"
              id="urgent-service"
              checked={isUrgent}
              onChange={toggleUrgent}
              className="w-4 h-4 text-yellow-600 border-yellow-300 rounded focus:ring-yellow-500"
            />
            <div>
              <label htmlFor="urgent-service" className="font-medium text-yellow-900 text-sm cursor-pointer">
                خدمة سريعة
              </label>
              <p className="text-xs text-yellow-700">إنجاز أسرع مع رسوم إضافية</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-yellow-600">+15%</span>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">تفاصيل السعر</h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">السعر الأساسي:</span>
            <span className="font-medium">{basePrice.toFixed(2)} جنيه</span>
          </div>
          
          {appliedDiscounts.length > 0 && (
            <>
              <div className="border-t border-gray-200 pt-2">
                <span className="text-gray-600">الخصومات:</span>
              </div>
              {appliedDiscounts.map((discount, index) => (
                <div key={index} className="flex justify-between text-green-600">
                  <span className="text-xs">{discount}</span>
                  <span className="text-xs">-</span>
                </div>
              ))}
            </>
          )}
          
          <div className="border-t border-gray-200 pt-2">
            <span className="text-gray-600">السعر النهائي:</span>
            <span className="font-bold text-lg text-green-600">{finalPrice.toFixed(2)} جنيه</span>
          </div>
          
          {totalDiscount > 0 && (
            <div className="text-center pt-2">
              <span className="text-sm text-green-600 font-medium">
                توفير: {totalDiscount.toFixed(2)} جنيه
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Estimated Completion */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900">الوقت المتوقع للإنجاز</h4>
            <p className="text-sm text-blue-700">
              {isUrgent ? `أقل من ${Math.max(1, Math.floor(etaDays * 0.7))} يوم` : `${etaDays} يوم`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl">⏱️</div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button 
        className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-300 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
      >
        إضافة للعربة - {finalPrice.toFixed(2)} جنيه
      </button>
    </div>
  );
}
