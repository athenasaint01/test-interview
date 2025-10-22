// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

import { PLAN_IMAGES } from "../constants/InsurancePage";

export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birthDateFormatted = new Date(birthDate.replace(/-/g, "/"));

  if (isNaN(birthDateFormatted.getTime())) {
    return NaN;
  }

  let age = today.getFullYear() - birthDateFormatted.getFullYear();
  const monthDiff = today.getMonth() - birthDateFormatted.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateFormatted.getDate())) {
    age--;
  }

  return age;
};

export const getPlanImage = (planName: string): string => {
  return PLAN_IMAGES[planName] || PLAN_IMAGES.default;
};

export const formatPrice = (price: number): string => {
  return price.toFixed(2);
};

export const escapeRegExp = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const normalizePlanName = (name: string): string =>
  name.trim().replace(/\s+/g, " ");
