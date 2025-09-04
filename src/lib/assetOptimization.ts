/**
 * Asset optimization utilities for images, fonts, and other resources
 */

/**
 * Generate responsive image sizes for different breakpoints
 */
export function generateResponsiveSizes(
  breakpoints: { [key: string]: number } = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  }
): string {
  const sizes = Object.entries(breakpoints)
    .sort(([, a], [, b]) => a - b)
    .map(([name, width], index, array) => {
      if (index === array.length - 1) {
        return '100vw'; // Default for largest breakpoint
      }
      return `(max-width: ${width}px) 100vw`;
    });

  return sizes.join(', ');
}

/**
 * Generate blur placeholder for images
 */
export function generateBlurPlaceholder(
  width: number = 10,
  height: number = 10,
  color: string = '#f3f4f6'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preload multiple images
 */
export async function preloadImages(sources: string[]): Promise<void> {
  try {
    await Promise.all(sources.map(preloadImage));
  } catch (error) {
    console.warn('Some images failed to preload:', error);
  }
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpeg' {
  if (typeof window === 'undefined') return 'jpeg';

  // Check for AVIF support
  const avifCanvas = document.createElement('canvas');
  avifCanvas.width = 1;
  avifCanvas.height = 1;
  const avifSupported = avifCanvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  
  if (avifSupported) return 'avif';

  // Check for WebP support
  const webpCanvas = document.createElement('canvas');
  webpCanvas.width = 1;
  webpCanvas.height = 1;
  const webpSupported = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  
  if (webpSupported) return 'webp';

  return 'jpeg';
}

/**
 * Calculate image dimensions while maintaining aspect ratio
 */
export function calculateAspectRatioDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight?: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = Math.min(originalWidth, maxWidth);
  let height = width / aspectRatio;
  
  if (maxHeight && height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(
  baseSrc: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920]
): string {
  return widths
    .map(width => {
      // This would typically integrate with your image CDN or optimization service
      const optimizedSrc = `${baseSrc}?w=${width}&q=75&f=webp`;
      return `${optimizedSrc} ${width}w`;
    })
    .join(', ');
}

/**
 * Lazy load CSS for non-critical styles
 */
export function loadCSS(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

/**
 * Preload fonts
 */
export function preloadFont(
  href: string,
  type: string = 'font/woff2',
  crossorigin: boolean = true
): void {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = type;
  link.href = href;
  if (crossorigin) {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
}

/**
 * Resource hints for better performance
 */
export class ResourceHints {
  /**
   * Add DNS prefetch for external domains
   */
  static dnsPrefetch(domain: string): void {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  }

  /**
   * Add preconnect for critical external resources
   */
  static preconnect(url: string, crossorigin: boolean = false): void {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    if (crossorigin) {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  }

  /**
   * Add prefetch for likely next page resources
   */
  static prefetch(url: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  /**
   * Add preload for critical resources
   */
  static preload(url: string, as: string, type?: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    if (type) {
      link.type = type;
    }
    document.head.appendChild(link);
  }
}

/**
 * Image compression utility (client-side)
 */
export function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const { width, height } = calculateAspectRatioDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Initialize performance optimizations
 */
export function initializeAssetOptimizations(): void {
  if (typeof window === 'undefined') return;

  // Preconnect to external domains
  ResourceHints.preconnect('https://fonts.googleapis.com');
  ResourceHints.preconnect('https://fonts.gstatic.com', true);
  
  // DNS prefetch for likely external resources
  ResourceHints.dnsPrefetch('supabase.co');
  ResourceHints.dnsPrefetch('googleapis.com');
  
  // Preload critical fonts
  preloadFont('/fonts/inter-var.woff2');
  
  console.log('Asset optimizations initialized');
}