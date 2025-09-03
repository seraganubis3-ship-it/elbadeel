"use client";

import { useState } from "react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  initial: string;
  color: string;
  text: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "أحمد محمد",
    role: "مستخدم",
    initial: "أ",
    color: "from-green-400 to-green-600",
    text: "خدمة ممتازة وسريعة، أنجزوا طلبي في أقل من يومين. أنصح الجميع بالتجربة!"
  },
  {
    id: 2,
    name: "فاطمة علي",
    role: "مستخدمة",
    initial: "ف",
    color: "from-blue-400 to-blue-600",
    text: "تجربة رائعة من البداية للنهاية. الفريق متعاون جداً والأسعار منافسة."
  },
  {
    id: 3,
    name: "محمد سعيد",
    role: "مستخدم",
    initial: "م",
    color: "from-purple-400 to-purple-600",
    text: "أفضل منصة لاستخراج الأوراق الرسمية. سعر معقول وجودة عالية."
  },
  {
    id: 4,
    name: "سارة أحمد",
    role: "مستخدمة",
    initial: "س",
    color: "from-pink-400 to-pink-600",
    text: "خدمة احترافية جداً، الفريق متعاون والأسعار منافسة. أنصح الجميع!"
  },
  {
    id: 5,
    name: "علي حسن",
    role: "مستخدم",
    initial: "ع",
    color: "from-orange-400 to-orange-600",
    text: "أسرع خدمة استخراج أوراق جربتها. أنجزوا طلبي في يوم واحد!"
  },
  {
    id: 6,
    name: "نورا محمد",
    role: "مستخدمة",
    initial: "ن",
    color: "from-teal-400 to-teal-600",
    text: "منصة موثوقة وسريعة، الأسعار معقولة والجودة ممتازة."
  }
];

export default function TestimonialsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  // Get current testimonial and next 2 for display
  const getVisibleTestimonials = () => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      result.push(testimonials[index]);
    }
    return result;
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-6 sm:py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">آراء عملائنا</h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">اكتشف ما يقوله عملاؤنا عن خدماتنا</p>
      </div>
      
      {/* Testimonials Container with Navigation */}
      <div className="relative">
        {/* Navigation Arrows */}
        <button
          onClick={prevTestimonial}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:border-emerald-300 transition-all duration-300 transform hover:scale-110 -translate-x-1/2"
          aria-label="السابق"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextTestimonial}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-emerald-600 hover:border-emerald-300 transition-all duration-300 transform hover:scale-110 translate-x-1/2"
          aria-label="التالي"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-all duration-500 ease-in-out">
          {visibleTestimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className={`bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 transition-all duration-500 transform ${
                index === 0 ? 'scale-105 shadow-xl border-emerald-200' : 'scale-100 opacity-90'
              }`}
            >
              <div className="flex items-center mb-3 sm:mb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg ml-2 sm:ml-3`}>
                  {testimonial.initial}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 text-xs sm:text-sm sm:text-base leading-relaxed">"{testimonial.text}"</p>
              <div className="flex text-yellow-400 mt-2 sm:mt-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-emerald-500 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`انتقل إلى رأي العميل ${index + 1}`}
            />
          ))}
        </div>

        {/* Counter */}
        <div className="text-center mt-4 text-sm text-gray-500">
          {currentIndex + 1} من {testimonials.length}
        </div>
      </div>
    </div>
  );
}
