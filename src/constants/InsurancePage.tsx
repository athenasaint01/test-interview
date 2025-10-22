// ============================================================================
// CONSTANTS
// ============================================================================

export const DISCOUNT_RATE = 0.95;
export const SCROLL_GAP = 16;
export const CARD_ANIMATION_DELAY = 200;
export const SCROLL_OFFSET = -100;
export const SCROLL_DELAY = 200;

export const PLAN_IMAGES: Record<string, string> = {
  "Plan en Casa": "/assets/icons/ico-plans-1.png",
  "Plan en Casa y Clínica": "/assets/icons/ico-plans-2.png",
  "Plan en Casa + Bienestar": "/assets/icons/ico-plans-1.png",
  "Plan en Casa + Chequeo": "/assets/icons/ico-plans-1.png",
  "Plan en Casa + Fitness": "/assets/icons/ico-plans-1.png",
  default: "/assets/icons/ico-plans-1.png",
};

export const HIGHLIGHT_PHRASES: Record<string, string[]> = {
  "Plan en Casa": [
    "Médico general a domicilio",
    "Videoconsulta",
    "Indemnización",
  ],
  "Plan en Casa y Clínica": [
    "Consultas en clínica",
    "Medicinas y exámenes",
    "más de 200 clínicas del país",
  ],
  "Plan en Casa + Chequeo": [
    "Un Chequeo preventivo general",
    "Vacunas",
    "Incluye todos los beneficios del Plan en Casa",
  ],
};
