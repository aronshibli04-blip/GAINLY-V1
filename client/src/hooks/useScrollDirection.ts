import { useState, useEffect, useRef } from 'react';

interface ScrollDirectionState {
  isVisible: boolean;
  scrollDirection: 'up' | 'down' | 'none';
  scrollY: number;
}

export function useScrollDirection(threshold: number = 50): ScrollDirectionState {
  const [scrollState, setScrollState] = useState<ScrollDirectionState>({
    isVisible: true,
    scrollDirection: 'none',
    scrollY: 0
  });
  
  const lastScrollY = useRef(0);
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
          
          // Determine visibility
          let isVisible = true;
          
          if (currentScrollY <= 10) {
            // Always show header at top of page
            isVisible = true;
          } else if (direction === 'down' && currentScrollY > threshold) {
            // Hide header when scrolling down past threshold
            isVisible = false;
          } else if (direction === 'up') {
            // Show header when scrolling up
            isVisible = true;
          } else {
            // Keep current visibility state
            isVisible = scrollState.isVisible;
          }
          
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
  }, [threshold, scrollState.isVisible]);

  return scrollState;
}