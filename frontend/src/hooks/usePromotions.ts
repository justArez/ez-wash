/**
 * usePromotions Hook - Manages fetching and caching of promotions
 * Feature: 004-homepage-shadcn-redesign
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { Promotion, UsePromotionsReturn } from "../types/homepage.types";
import {
  fetchPromotions,
  refreshPromotionsCache,
} from "../services/api.service";

export function usePromotions(): UsePromotionsReturn {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch promotions on mount
  useEffect(() => {
    isMountedRef.current = true;

    const loadPromotions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPromotions();
        if (isMountedRef.current) {
          setPromotions(data);
        }
      } catch (err) {
        if (isMountedRef.current) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch promotions";
          setError(message);
          console.error("[usePromotions] Error:", message);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadPromotions();
  }, []);

  // Manual refetch
  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await refreshPromotionsCache();
      if (isMountedRef.current) {
        setPromotions(data);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch promotions";
        setError(message);
        console.error("[usePromotions] Refetch error:", message);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  return {
    promotions,
    loading,
    error,
    refetch,
  };
}
