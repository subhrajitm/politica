'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageWithPlaceholderProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'user' | 'image' | 'custom';
  customPlaceholder?: React.ReactNode;
  onError?: () => void;
  onLoad?: () => void;
}

export default function ImageWithPlaceholder({
  src,
  alt,
  fill = false,
  width,
  height,
  className,
  sizes,
  priority = false,
  placeholder = 'user',
  customPlaceholder,
  onError,
  onLoad,
}: ImageWithPlaceholderProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleError = () => {
    setImageError(true);
    setImageLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setImageLoading(false);
    onLoad?.();
  };

  // Show placeholder if no src, error loading, or still loading
  const showPlaceholder = !src || imageError || (imageLoading && !src);

  if (showPlaceholder) {
    const placeholderContent = customPlaceholder || (
      <div className="flex items-center justify-center bg-muted text-muted-foreground">
        {placeholder === 'user' && <User className="w-1/3 h-1/3" />}
        {placeholder === 'image' && <ImageIcon className="w-1/3 h-1/3" />}
      </div>
    );

    if (fill) {
      return (
        <div className={cn("relative", className)}>
          {placeholderContent}
        </div>
      );
    }

    return (
      <div 
        className={cn("flex items-center justify-center bg-muted text-muted-foreground", className)}
        style={{ width, height }}
      >
        {placeholderContent}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      sizes={sizes}
      priority={priority}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
}
