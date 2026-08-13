/**
 * useSlots Hook - Manages fetching, caching, and auto-refresh of time slots
 * Feature: 004-homepage-shadcn-redesign
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { TimeSlot, UseSlotsReturn } from "../types/homepage.types";
import { fetchSlots, refreshSlotsCache } from "../services/api.service";

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useSlots(days: number = 7): UseSlotsReturn {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);
  const [nextRefreshCountdown, setNextRefreshCountdown] = useState(
    AUTO_REFRESH_INTERVAL / 1000,
  );

  const autoRefreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (autoRefreshTimerRef.current)
        clearInterval(autoRefreshTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  // Fetch slots on mount and setup auto-refresh
  useEffect(() => {
    isMountedRef.current = true;

    const loadSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchSlots(days);
        if (isMountedRef.current) {
          setSlots(data);
          setLastRefreshTime(Date.now());
          setNextRefreshCountdown(AUTO_REFRESH_INTERVAL / 1000); // Start countdown in seconds
        }
      } catch (err) {
        if (isMountedRef.current) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch slots";
          setError(message);
          console.error("[useSlots] Error:", message);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadSlots();
  }, [days]);

  // Auto-refresh countdown timer
  useEffect(() => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      setNextRefreshCountdown((prev) => {
        if (prev <= 1) {
          // Trigger auto-refresh when countdown reaches 0
          return AUTO_REFRESH_INTERVAL / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  // Auto-refresh slots every 5 minutes
  useEffect(() => {
    if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current);

    autoRefreshTimerRef.current = setInterval(async () => {
      if (!isMountedRef.current) return;

      try {
        const data = await refreshSlotsCache(days);
        if (isMountedRef.current) {
          setSlots(data);
          setLastRefreshTime(Date.now());
          setNextRefreshCountdown(AUTO_REFRESH_INTERVAL / 1000); // Reset countdown
        }
      } catch (err) {
        if (isMountedRef.current) {
          const message =
            err instanceof Error ? err.message : "Auto-refresh failed";
          console.warn("[useSlots] Auto-refresh error:", message);
          // Don't update error state on auto-refresh to avoid disrupting user
        }
      }
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (autoRefreshTimerRef.current)
        clearInterval(autoRefreshTimerRef.current);
    };
  }, [days]);

  // Manual refetch
  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await refreshSlotsCache(days);
      if (isMountedRef.current) {
        setSlots(data);
        setLastRefreshTime(Date.now());
        setNextRefreshCountdown(AUTO_REFRESH_INTERVAL / 1000); // Reset countdown on manual refresh
      }
    } catch (err) {
      if (isMountedRef.current) {
        const message =
          err instanceof Error ? err.message : "Failed to refresh slots";
        setError(message);
        console.error("[useSlots] Refetch error:", message);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [days]);

  return {
    slots,
    loading,
    error,
    refetch,
    lastRefreshTime,
    nextRefreshCountdown,
  };
}
