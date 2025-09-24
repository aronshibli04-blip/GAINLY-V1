import { useState, useEffect, useRef } from 'react';

interface ScrollDirectionState {
  isVisible: boolean;
  scrollDirection: 'up' | 'down' | 'none';
  scrollY: number;
}

export function useScrollDirection(threshold: number = 50): ScrollDirectionState {
  const [scrollState, setScrollState] = useState<ScrollDirectionState>({
    isVisible: false, // Start with date hidden
    scrollDirection: 'none',
    scrollY: 0
  });
  
  const lastScrollY = useRef(0);
  const lastVisibility = useRef(false);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDifference = currentScrollY - lastScrollY.current;
          
          // Determine scroll direction
          let direction: 'up' | 'down' | 'none' = 'none';
          if (Math.abs(scrollDifference) > 5) { // Minimum scroll threshold to avoid jitter
            direction = scrollDifference > 0 ? 'down' : 'up';
          }
          
          // Determine visibility - start hidden, only show on scroll up
          let isVisible = false;
          
          if (currentScrollY <= 5) {
            // Only show at very top of page
            isVisible = true;
          } else if (direction === 'up') {
            // Show when scrolling up
            isVisible = true;
          } else if (direction === 'down' && currentScrollY > threshold) {
            // Hide when scrolling down past threshold
            isVisible = false;
          } else {
            // Keep current visibility state - read from ref to avoid stale state
            isVisible = lastVisibility.current;
          }
          
          // Update ref with current visibility to prevent stale state issues
          lastVisibility.current = isVisible;
          
          setScrollState({
            isVisible,
            scrollDirection: direction,
            scrollY: currentScrollY
          });
          
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]); // Optimized: removed scrollState.isVisible dependency

  return scrollState;
}