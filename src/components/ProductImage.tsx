import React, { useState } from 'react';
import { Utensils } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ src, alt, className = '' }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/50 text-zinc-300 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Utensils className="w-8 h-8 text-orange-500 mb-2" />
        <span className="text-sm font-semibold text-orange-50 px-4 text-center line-clamp-1">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
