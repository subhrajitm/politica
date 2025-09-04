/**
 * Mobile Performance Optimizations
 */

export class MobileOptimizations {
  private static instance: MobileOptimizations;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): MobileOptimizations {
    if (!MobileOptimizations.instance) {
      MobileOptimizations.instance = new MobileOptimizations();
    }
    return MobileOptimizations.instance;
  }

  init(): void {
    if (this.isInitialized) return;

    this.setupViewportOptimizations();
    this.setupTouchOptimizations();
    this.setupPerformanceOptimizations();
    this.setupAccessibilityOptimizations();
    this.setupBatteryOptimizations();

    this.isInitialized = true;
    console.log('Mobile optimizations initialized');
  }

  private setupViewportOptimizations(): void {
    // Prevent zoom on input focus
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
      );
    }

    // Handle viewport height changes (mobile keyboard)
    const updateViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);

    // Handle visual viewport for better mobile support
    if (window.visualViewport) {
      const handleVisualViewportChange = () => {
        const vh = window.visualViewport!.height * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
    }
  }

  private setupTouchOptimizations(): void {
    // Disable 300ms tap delay
    document.addEventListener('touchstart', () => {}, { passive: true });

    // Prevent default touch behaviors that can interfere with gestures
    document.addEventListener('touchmove', (e) => {
      // Allow scrolling but prevent other default behaviors
      if (e.target instanceof HTMLElement) {
        const element = e.target;
        if (!element.closest('.allow-default-touch')) {
          // Only prevent default for specific cases
          if (element.tagName === 'BUTTON' || element.role === 'button') {
            e.preventDefault();
          }
        }
      }
    }, { passive: false });

    // Add touch feedback classes
    document.addEventListener('touchstart', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('touch-feedback')) {
        target.classList.add('touch-active');
      }
    });

    document.addEventListener('touchend', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('touch-feedback')) {
        setTimeout(() => target.classList.remove('touch-active'), 150);
      }
    });
  }

  private setupPerformanceOptimizations(): void {
    // Optimize scrolling performance
    const scrollElements = document.querySelectorAll('.scroll-container');
    scrollElements.forEach(element => {
      (element as HTMLElement).style.webkitOverflowScrolling = 'touch';
      (element as HTMLElement).style.transform = 'translateZ(0)';
    });

    // Lazy load images with Intersection Observer
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.1
      });

      // Observe all images with data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }

    // Optimize animations for mobile
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      document.documentElement.classList.add('reduce-motion');
    }

    prefersReducedMotion.addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    });
  }

  private setupAccessibilityOptimizations(): void {
    // Improve focus management for mobile
    let isUsingKeyboard = false;

    document.addEventListener('keydown', () => {
      isUsingKeyboard = true;
      document.documentElement.classList.add('using-keyboard');
    });

    document.addEventListener('mousedown', () => {
      isUsingKeyboard = false;
      document.documentElement.classList.remove('using-keyboard');
    });

    document.addEventListener('touchstart', () => {
      isUsingKeyboard = false;
      document.documentElement.classList.remove('using-keyboard');
    });

    // Announce page changes for screen readers
    const announcePageChange = (title: string) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Page changed to ${title}`;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    };

    // Listen for route changes
    let currentTitle = document.title;
    const titleObserver = new MutationObserver(() => {
      if (document.title !== currentTitle) {
        announcePageChange(document.title);
        currentTitle = document.title;
      }
    });

    titleObserver.observe(document.querySelector('title')!, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  private setupBatteryOptimizations(): void {
    // Reduce animations and effects when battery is low
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBatteryOptimizations = () => {
          if (battery.level < 0.2 || !battery.charging) {
            document.documentElement.classList.add('low-battery');
          } else {
            document.documentElement.classList.remove('low-battery');
          }
        };

        updateBatteryOptimizations();
        battery.addEventListener('levelchange', updateBatteryOptimizations);
        battery.addEventListener('chargingchange', updateBatteryOptimizations);
      });
    }

    // Reduce activity when page is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        document.documentElement.classList.add('page-hidden');
      } else {
        document.documentElement.classList.remove('page-hidden');
      }
    });
  }

  // Haptic feedback utilities
  static triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 20,
        medium: 50,
        heavy: 100
      };
      navigator.vibrate(patterns[type]);
    }
  }

  // Network-aware optimizations
  static setupNetworkOptimizations(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateNetworkOptimizations = () => {
        const effectiveType = connection.effectiveType;
        
        // Reduce quality for slow connections
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          document.documentElement.classList.add('slow-connection');
        } else {
          document.documentElement.classList.remove('slow-connection');
        }

        // Save data mode
        if (connection.saveData) {
          document.documentElement.classList.add('save-data');
        } else {
          document.documentElement.classList.remove('save-data');
        }
      };

      updateNetworkOptimizations();
      connection.addEventListener('change', updateNetworkOptimizations);
    }
  }

  // Memory management
  static cleanupUnusedResources(): void {
    // Clean up unused images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.isConnected) {
        img.src = '';
      }
    });

    // Clean up unused event listeners
    if ('FinalizationRegistry' in window) {
      // Use FinalizationRegistry for automatic cleanup if available
      const cleanup = new FinalizationRegistry((heldValue: any) => {
        console.log('Cleaning up resources:', heldValue);
      });
    }

    // Force garbage collection if available (development only)
    if (process.env.NODE_ENV === 'development' && 'gc' in window) {
      (window as any).gc();
    }
  }
}

// Auto-initialize on mobile devices
if (typeof window !== 'undefined' && window.innerWidth < 768) {
  document.addEventListener('DOMContentLoaded', () => {
    MobileOptimizations.getInstance().init();
    MobileOptimizations.setupNetworkOptimizations();
  });
}

export default MobileOptimizations;