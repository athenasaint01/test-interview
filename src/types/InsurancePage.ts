// ============================================================================
// TYPES & INTERFACES
// ============================================================================

import { type Plan } from "../services/plansApi";

export type UserOption = "personal" | "someone";

export interface UsePlansDataReturn {
  plans: Plan[];
  loadingPlans: boolean;
  errorPlans: string | null;
}

export interface UseSliderControlsReturn {
  sliderRef: React.RefObject<HTMLDivElement | null>;
  canPrev: boolean;
  canNext: boolean;
  currentSlide: number;
  totalSlides: number;
  scrollByOneCard: (direction: "prev" | "next") => void;
}
