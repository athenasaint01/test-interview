// ============================================================================
// CUSTOM HOOKS
// ============================================================================

import { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchPlans,
  filterPlansByAge,
  type Plan,
} from "../services/plansApi";
import { SCROLL_GAP } from "../constants/InsurancePage";
import type {
  UsePlansDataReturn,
  UseSliderControlsReturn,
} from "../types/InsurancePage";

export const usePlansData = (userAge: number): UsePlansDataReturn => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [errorPlans, setErrorPlans] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    let ignore = false;

    setLoadingPlans(true);
    setErrorPlans(null);

    try {
      const allPlans = await fetchPlans();

      if (!ignore) {
        const eligiblePlans = filterPlansByAge(allPlans, userAge);
        setPlans(eligiblePlans);
        setLoadingPlans(false);
      }
    } catch (error) {
      if (!ignore) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error desconocido al cargar planes";
        setErrorPlans(errorMessage);
        setLoadingPlans(false);
        console.error("Error loading plans:", error);
      }
    }

    // Cleanup to prevent state updates on unmounted component
    return () => {
      ignore = true;
    };
  }, [userAge]);

  useEffect(() => {
    let cleanupFn: (() => void) | undefined;
    loadPlans().then(cleanup => {
      cleanupFn = cleanup;
    });
    return () => {
      cleanupFn?.();
    };
  }, [loadPlans]);

  return { plans, loadingPlans, errorPlans };
};

export const useSliderControls = (filteredPlansLength: number): UseSliderControlsReturn => {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(0);

  const updateArrows = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const maxScroll = slider.scrollWidth - slider.clientWidth - 1;
    setCanPrev(slider.scrollLeft > 1);
    setCanNext(slider.scrollLeft < maxScroll);

    // Calculate current slide (mobile: one card per view)
    const firstCard = slider.querySelector<HTMLElement>(".plan-card");
    if (firstCard && filteredPlansLength) {
      const cardWidth = firstCard.offsetWidth;
      const visibleStep = cardWidth + SCROLL_GAP;
      const rawIndex = Math.round(slider.scrollLeft / visibleStep);
      const idx = Math.min(Math.max(rawIndex + 1, 1), filteredPlansLength);
      setCurrentSlide(idx);
    }
  }, [filteredPlansLength]);

  const scrollByOneCard = useCallback((direction: "prev" | "next") => {
    const slider = sliderRef.current;
    if (!slider) return;

    const firstCard = slider.querySelector<HTMLElement>(".plan-card");
    const scrollDistance = firstCard
      ? firstCard.offsetWidth + SCROLL_GAP
      : Math.round(slider.clientWidth * 0.9);

    const scrollAmount =
      direction === "next" ? scrollDistance : -scrollDistance;

    slider.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  }, []);

  // Setup slider scroll listener
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.addEventListener("scroll", updateArrows, { passive: true });
    updateArrows();

    return () => {
      slider.removeEventListener("scroll", updateArrows);
    };
  }, [updateArrows]);

  // Reset counter when filtered plans change
  useEffect(() => {
    setTotalSlides(filteredPlansLength);
    setCurrentSlide(filteredPlansLength ? 1 : 0);
  }, [filteredPlansLength]);

  return {
    sliderRef,
    canPrev,
    canNext,
    currentSlide,
    totalSlides,
    scrollByOneCard,
  };
};
