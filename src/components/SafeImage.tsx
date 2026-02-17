import React, { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fallback?: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  [key: string]: any;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  width = 400,
  height = 300,
  fallback,
  className,
  priority = false,
  quality = 80,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Generate placeholder SVG
  const generatePlaceholder = (text: string = alt) => {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#059669"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dy=".3em">
          ${text}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const handleError = () => {
    if (fallback && !hasError) {
      setImageSrc(fallback);
      setHasError(true);
    } else {
      // Use placeholder if fallback also fails
      setImageSrc(generatePlaceholder());
    }
  };

  // Check if src is a URL
  const isValidUrl = imageSrc && (imageSrc.startsWith('/') || imageSrc.startsWith('http'));

  if (!isValidUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 select-none ${className}`}
        style={{ width, height }}
        {...props}
      >
        <span style={{ fontSize: width ? Math.min(width, height || width) * 0.5 : '2rem' }}>
          {imageSrc || alt || '🖼️'}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      quality={quality}
      onError={handleError}
      {...props}
    />
  );
};

export default SafeImage;
