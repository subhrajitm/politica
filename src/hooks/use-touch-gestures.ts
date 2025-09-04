/**
 * React hook for touch gestures and mobile interactions
 */

import { useRef, useEffect, useCallback } from 'react';

export interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPinch?: (scale: number) => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
}

export function useTouchGestures(options: TouchGestureOptions = {}) {
  const elementRef = useRef<HTMLElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialDistanceRef = useRef<number>(0);

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onLongPress,
    onPinch,
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
  } = options;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    // Handle multi-touch for pinch gestures
    if (e.touches.length === 2 && onPinch) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialDistanceRef.current = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
    }

    // Start long press timer
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        onLongPress();
        // Trigger haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay, onPinch]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Cancel long press on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle pinch gesture
    if (e.touches.length === 2 && onPinch && initialDistanceRef.current > 0) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      const scale = currentDistance / initialDistanceRef.current;
      onPinch(scale);
    }
  }, [onPinch]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Handle swipe gestures
    if (distance > swipeThreshold && deltaTime < 500) {
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
          // Trigger haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(30);
          }
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
          // Trigger haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(30);
          }
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
          // Trigger haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(30);
          }
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
          // Trigger haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(30);
          }
        }
      }
    }
    // Handle tap gestures
    else if (distance < 10 && deltaTime < 300) {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;

      if (timeSinceLastTap < doubleTapDelay && onDoubleTap) {
        onDoubleTap();
        // Trigger haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([30, 50, 30]);
        }
        lastTapRef.current = 0; // Reset to prevent triple tap
      } else {
        lastTapRef.current = now;
        // Delay single tap to check for double tap
        setTimeout(() => {
          if (lastTapRef.current === now && onTap) {
            onTap();
            // Trigger light haptic feedback
            if ('vibrate' in navigator) {
              navigator.vibrate(20);
            }
          }
        }, doubleTapDelay);
      }
    }

    touchStartRef.current = null;
    initialDistanceRef.current = 0;
  }, [
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    swipeThreshold,
    doubleTapDelay,
  ]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return elementRef;
}

// Hook for pull-to-refresh functionality
export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
  const elementRef = useRef<HTMLElement>(null);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const isRefreshingRef = useRef<boolean>(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      startYRef.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshingRef.current) {
      currentYRef.current = e.touches[0].clientY;
      const pullDistance = currentYRef.current - startYRef.current;

      if (pullDistance > 0) {
        e.preventDefault();
        
        // Add visual feedback
        const element = elementRef.current;
        if (element) {
          const maxPull = 100;
          const normalizedPull = Math.min(pullDistance / maxPull, 1);
          element.style.transform = `translateY(${pullDistance * 0.5}px)`;
          element.style.opacity = `${1 - normalizedPull * 0.3}`;
        }
      }
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    const pullDistance = currentYRef.current - startYRef.current;
    const element = elementRef.current;

    if (element) {
      element.style.transform = '';
      element.style.opacity = '';
    }

    if (pullDistance > 80 && window.scrollY === 0 && !isRefreshingRef.current) {
      isRefreshingRef.current = true;
      
      // Trigger haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      try {
        await onRefresh();
      } finally {
        isRefreshingRef.current = false;
      }
    }

    startYRef.current = 0;
    currentYRef.current = 0;
  }, [onRefresh]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return elementRef;
}