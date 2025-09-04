/**
 * CDN configuration and asset delivery optimization
 */

/**
 * CDN configuration
 */
export const CDN_CONFIG = {
  // For production, you would configure your CDN URL here
  baseUrl: process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_CDN_URL || ''
    : '',
  
  // Image optimization parameters
  imageParams: {
    quality: 75,
    format: 'webp',
    progressive: true,
  },
  
  // Cache headers
  cacheHeaders: {
    images: 'public, max-age=31536000, immutable', // 1 year
    fonts: 'public, max-age=31536000, immutable',   // 1 year
    css: 'public, max-age=31536000, immutable',     // 1 year
    js: 'public, max-age=31536000, immutable',      // 1 year
    html: 'public, max-age=3600',                   // 1 hour
  }
};

/**
 * Generate CDN URL for assets
 */
export function getCDNUrl(path: string, params?: Record<string, string | number>): string {
  const baseUrl = CDN_CONFIG.baseUrl || '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (!baseUrl) {
    return cleanPath;
  }
  
  const url = new URL(cleanPath, baseUrl);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }
  
  return url.toString();
}

/**
 * Generate optimized image URL
 */
export function getOptimizedImageUrl(
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  } = {}
): string {
  // If it's already an external URL, return as-is
  if (src.startsWith('http')) {
    return src;
  }
  
  const params: Record<string, string | number> = {
    q: options.quality || CDN_CONFIG.imageParams.quality,
    f: options.format || CDN_CONFIG.imageParams.format,
  };
  
  if (options.width) params.w = options.width;
  if (options.height) params.h = options.height;
  if (options.fit) params.fit = options.fit;
  
  return getCDNUrl(src, params);
}

/**
 * Generate responsive image URLs for different screen sizes
 */
export function getResponsiveImageUrls(
  src: string,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1920],
  options: {
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
  } = {}
): Array<{ url: string; width: number }> {
  return sizes.map(width => ({
    url: getOptimizedImageUrl(src, { ...options, width }),
    width,
  }));
}

/**
 * Preload critical assets
 */
export function preloadCriticalAssets(): void {
  if (typeof window === 'undefined') return;
  
  const criticalAssets = [
    // Add your critical assets here
    '/images/logo.svg',
    '/images/placeholder-politician.jpg',
  ];
  
  criticalAssets.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = getCDNUrl(asset);
    
    if (asset.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
      link.as = 'image';
    } else if (asset.match(/\.(woff|woff2|ttf|otf)$/i)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    } else if (asset.match(/\.css$/i)) {
      link.as = 'style';
    } else if (asset.match(/\.js$/i)) {
      link.as = 'script';
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Set up service worker for asset caching
 */
export function setupAssetCaching(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('Service Worker registered:', registration);
    })
    .catch(error => {
      console.log('Service Worker registration failed:', error);
    });
}

/**
 * Image loading strategies
 */
export const IMAGE_LOADING_STRATEGIES = {
  // Critical images (above the fold)
  critical: {
    priority: true,
    quality: 85,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  },
  
  // Hero images
  hero: {
    priority: true,
    quality: 90,
    sizes: '100vw',
  },
  
  // Politician avatars
  avatar: {
    priority: false,
    quality: 80,
    sizes: '(max-width: 768px) 64px, 96px',
  },
  
  // Gallery images
  gallery: {
    priority: false,
    quality: 75,
    sizes: '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw',
  },
  
  // Thumbnail images
  thumbnail: {
    priority: false,
    quality: 70,
    sizes: '(max-width: 768px) 25vw, 150px',
  },
};

/**
 * Get loading strategy for image type
 */
export function getImageLoadingStrategy(type: keyof typeof IMAGE_LOADING_STRATEGIES) {
  return IMAGE_LOADING_STRATEGIES[type] || IMAGE_LOADING_STRATEGIES.gallery;
}

/**
 * Progressive image loading
 */
export class ProgressiveImageLoader {
  private static loadedImages = new Set<string>();
  
  static async loadImage(src: string, lowQualitySrc?: string): Promise<string> {
    // Return immediately if already loaded
    if (this.loadedImages.has(src)) {
      return src;
    }
    
    // Load low quality version first if provided
    if (lowQualitySrc) {
      try {
        await this.preloadImage(lowQualitySrc);
      } catch (error) {
        console.warn('Failed to load low quality image:', error);
      }
    }
    
    // Load high quality version
    await this.preloadImage(src);
    this.loadedImages.add(src);
    
    return src;
  }
  
  private static preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }
  
  static clearCache(): void {
    this.loadedImages.clear();
  }
}