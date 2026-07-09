import { useRef, useState, useEffect } from 'react';

export function useDragScroll() {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const ele = ref.current;
    if (!ele) return;

    const handleMouseDown = (e) => {
      setIsDragging(true);
      setStartX(e.pageX - ele.offsetLeft);
      setScrollLeft(ele.scrollLeft);
    };

    const handleMouseLeave = () => {
      setIsDragging(false);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - ele.offsetLeft;
      const walk = (x - startX) * 2; // Scroll-fast
      ele.scrollLeft = scrollLeft - walk;
    };

    ele.addEventListener('mousedown', handleMouseDown);
    ele.addEventListener('mouseleave', handleMouseLeave);
    ele.addEventListener('mouseup', handleMouseUp);
    ele.addEventListener('mousemove', handleMouseMove);

    return () => {
      ele.removeEventListener('mousedown', handleMouseDown);
      ele.removeEventListener('mouseleave', handleMouseLeave);
      ele.removeEventListener('mouseup', handleMouseUp);
      ele.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, startX, scrollLeft]);

  return { ref, isDragging };
}
