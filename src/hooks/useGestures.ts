import { useEffect, useRef } from "react";
import Hammer from "hammerjs";

export const useGestures = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  onTap?: () => void
) => {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const hammer = new Hammer(elementRef.current);
    hammer.get("swipe").set({ direction: Hammer.DIRECTION_ALL });

    if (onSwipeLeft) {
      hammer.on("swipeleft", onSwipeLeft);
    }
    if (onSwipeRight) {
      hammer.on("swiperight", onSwipeRight);
    }
    if (onSwipeUp) {
      hammer.on("swipeup", onSwipeUp);
    }
    if (onSwipeDown) {
      hammer.on("swipedown", onSwipeDown);
    }
    if (onTap) {
      hammer.on("tap", onTap);
    }

    return () => {
      hammer.destroy();
    };
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap]);

  return elementRef;
};











