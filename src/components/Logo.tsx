import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 lg:gap-3 group">
      <div className="relative">
        {/* Main Logo Container */}
        <div className="relative">
          {/* Registered Trademark Symbol */}
          <div className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-white rounded-full flex items-center justify-center shadow-md">
            <span className="text-xs font-bold text-green-800">®</span>
          </div>
          
          {/* Logo Image */}
          <div className="w-12 h-12 lg:w-14 lg:h-14 relative rounded-full overflow-hidden border-2 border-white/20 shadow-lg">
            <Image
              src="/logo.jpg"
              alt="منصة البديل"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
      
      {/* Tagline */}
      <div className="hidden lg:block">
        <div className="text-sm lg:text-base font-semibold text-white leading-tight whitespace-nowrap">خدمات استخراج الأوراق الرسمية</div>
        <div className="text-xs lg:text-sm text-white/90 leading-tight whitespace-nowrap">منصة موثوقة وسريعة</div>
      </div>
    </Link>
  );
}
