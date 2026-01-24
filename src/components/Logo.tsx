import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href='/' className='flex items-center gap-1 sm:gap-2 md:gap-3 group'>
      <div className='relative'>
        {/* Main Logo Container */}
        <div className='relative'>
          {/* Registered Trademark Symbol */}
          <div className='absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-white rounded-full flex items-center justify-center shadow-md'>
            <span className='text-xs sm:text-xs md:text-sm font-bold text-green-800'>®</span>
          </div>

          {/* Logo Image */}
          <div className='w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 relative rounded-full overflow-hidden border-2 border-white/20 shadow-lg'>
            <Image src='/logo.jpg' alt='منصة البديل' fill className='object-cover' priority />
          </div>
        </div>
      </div>

      {/* Tagline - Hidden on very small screens, shown on medium and up */}
      <div className='hidden md:block'>
        <div className='text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-white leading-tight whitespace-nowrap'>
          خدمات استخراج الأوراق الرسمية
        </div>
        <div className='text-xs sm:text-xs md:text-sm lg:text-base text-white/90 leading-tight whitespace-nowrap'>
          منصة موثوقة وسريعة
        </div>
      </div>

      {/* Short tagline for small screens */}
      <div className='md:hidden'>
        <div className='text-xs sm:text-sm font-semibold text-white leading-tight whitespace-nowrap'>
          البديل
        </div>
      </div>
    </Link>
  );
}
