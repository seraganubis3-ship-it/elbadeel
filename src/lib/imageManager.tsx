// Image management utility for handling missing images and fallbacks
import React from 'react';
import Image from 'next/image';

export interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fallback?: string;
  placeholder?: string;
}

// List of known images with their fallbacks
const imageRegistry: Record<string, ImageConfig> = {
  'passports.jpg': {
    src: '/images/passports.jpg',
    alt: 'جوازات السفر',
    width: 400,
    height: 300,
    fallback: '/images/passports.png',
  },
  'government-services-bg.png': {
    src: '/images/government-services-bg.png',
    alt: 'خلفية الخدمات الحكومية',
    width: 1200,
    height: 600,
    fallback: '/images/government-services-bg.jpg',
  },
  'official-documents.jpg': {
    src: '/images/official-documents.jpg',
    alt: 'الوثائق الرسمية',
    width: 400,
    height: 300,
    fallback: '/images/official-documents.png',
  },
  'national-id.jpg': {
    src: '/images/national-id.jpg',
    alt: 'البطاقة الشخصية',
    width: 400,
    height: 300,
    fallback: '/images/national-id.png',
  },
  'egyptian-foreign-affairs.jpg': {
    src: '/images/egyptian-foreign-affairs.jpg',
    alt: 'وزارة الخارجية المصرية',
    width: 400,
    height: 300,
    fallback: '/images/egyptian-foreign-affairs.png',
  },
};

// Check if image exists
export async function checkImageExists(src: string): Promise<boolean> {
  try {
    const response = await fetch(src, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Get image configuration with fallback
export function getImageConfig(imageName: string): ImageConfig {
  const config = imageRegistry[imageName];
  if (!config) {
    return {
      src: `/images/${imageName}`,
      alt: imageName.replace(/\.(jpg|png|jpeg|gif)$/, ''),
      width: 400,
      height: 300,
      fallback: '/images/placeholder.svg',
    };
  }
  return config;
}

// Generate placeholder SVG
export function generatePlaceholderSVG(
  width: number = 400,
  height: number = 300,
  text: string = 'صورة',
  color: string = '#059669'
): string {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dy=".3em">
        ${text}
      </text>
    </svg>
  `)}`;
}

// Image component with error handling
export function SafeImage({
  src,
  alt,
  width,
  height,
  fallback,
  ...props
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fallback?: string;
  [key: string]: any;
}) {
  const [imageSrc, setImageSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);

  const handleError = () => {
    if (fallback && !hasError) {
      setImageSrc(fallback);
      setHasError(true);
    } else {
      setImageSrc(generatePlaceholderSVG(width, height, alt));
    }
  };

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      onError={handleError}
      {...props}
    />
  );
}

// Preload images
export async function preloadImages(imageNames: string[]): Promise<void> {
  const promises = imageNames.map(async name => {
    const config = getImageConfig(name);
    try {
      await checkImageExists(config.src);
    } catch {
      // تجاهل الأخطاء
    }
  });

  await Promise.all(promises);
}

// Get all available images
export function getAvailableImages(): string[] {
  return Object.keys(imageRegistry);
}

// Add new image to registry
export function registerImage(name: string, config: ImageConfig): void {
  imageRegistry[name] = config;
}
