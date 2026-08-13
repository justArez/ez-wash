/**
 * useCarouselTimer Hook - Manages carousel auto-advance timer
 * Feature: 004-homepage-shadcn-redesign
 *
 * Features:
 * - Auto-advances every 30 seconds
 * - Manual navigation (prev/next) resets countdown
 * - Pause/resume functionality
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { UseCarouselTimerReturn } from "../types/homepage.types";

const AUTO_ADVANCE_INTERVAL = 30 * 1000; // 30 seconds in milliseconds

export function useCarouselTimer(itemCount: number): UseCarouselTimerReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [countdown, setCountdown] = useState(AUTO_ADVANCE_INTERVAL / 1000); // in seconds

  const autoAdvanceTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (autoAdvanceTimerRef.current)
        clearInterval(autoAdvanceTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  // Countdown timer - updates every second
  useEffect(() => {
    if (!isAutoPlaying || itemCount === 0) return;

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return AUTO_ADVANCE_INTERVAL / 1000; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isAutoPlaying, itemCount]);

  // Auto-advance timer
  useEffect(() => {
    if (!isAutoPlaying || itemCount === 0) return;

    if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);

    autoAdvanceTimerRef.current = setInterval(() => {
      if (isMountedRef.current) {
        setCurrentIndex((prev) => (prev + 1) % itemCount);
        setCountdown(AUTO_ADVANCE_INTERVAL / 1000); // Reset countdown
      }
    }, AUTO_ADVANCE_INTERVAL);

    return () => {
      if (autoAdvanceTimerRef.current)
        clearInterval(autoAdvanceTimerRef.current);
    };
  }, [isAutoPlaying, itemCount]);

  // Advance to next slide (manual)
  const advance = useCallback(() => {
    if (itemCount === 0) return;
    setCurrentIndex((prev) => (prev + 1) % itemCount);
    setCountdown(AUTO_ADVANCE_INTERVAL / 1000); // Reset countdown
  }, [itemCount]);

  // Go to previous slide (manual)
  const previous = useCallback(() => {
    if (itemCount === 0) return;
    setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount);
    setCountdown(AUTO_ADVANCE_INTERVAL / 1000); // Reset countdown
  }, [itemCount]);

  // Go to specific slide
  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < itemCount) {
        setCurrentIndex(index);
        setCountdown(AUTO_ADVANCE_INTERVAL / 1000); // Reset countdown
      }
    },
    [itemCount],
  );

  // Reset countdown (but don't auto-advance)
  const resetCountdown = useCallback(() => {
    setCountdown(AUTO_ADVANCE_INTERVAL / 1000);
  }, []);

  // Stop auto-play
  const stop = useCallback(() => {
    setIsAutoPlaying(false);
    if (autoAdvanceTimerRef.current) clearInterval(autoAdvanceTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
  }, []);

  // Resume auto-play
  const resume = useCallback(() => {
    setIsAutoPlaying(true);
    setCountdown(AUTO_ADVANCE_INTERVAL / 1000);
  }, []);

  return {
    currentIndex,
    isAutoPlaying,
    countdown,
    advance,
    previous,
    goToSlide,
    resetCountdown,
    stop,
    resume,
  };
}
