// ============================================================================
// PLANS API SERVICE
// ============================================================================

/**
 * Interface para un plan individual
 */
export interface Plan {
  id: string | number;
  name: string;
  age: number;
  price: number;
  description?: string[];
}

/**
 * Interface para la respuesta de la API de planes
 */
export interface PlanApiResponse {
  list?: Plan[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PLANS_API_URL = "https://rimac-front-end-challenge.netlify.app/api/plans.json";

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Obtiene todos los planes desde la API
 * @returns Promise con el array de planes
 * @throws Error si la petición falla
 */
export const fetchPlans = async (): Promise<Plan[]> => {
  try {
    const response = await fetch(PLANS_API_URL);

    if (!response.ok) {
      throw new Error(
        `HTTP Error: ${response.status} - ${response.statusText}`
      );
    }

    const data: PlanApiResponse | Plan[] = await response.json();

    let allPlans: Plan[] = [];

    // Handle different response structures
    if (Array.isArray(data)) {
      allPlans = data.flatMap((item: any) => item.list || []);
    } else if (data.list && Array.isArray(data.list)) {
      allPlans = data.list;
    } else {
      throw new Error("Estructura de datos inválida");
    }

    return allPlans;
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error;
  }
};

/**
 * Filtra planes por edad mínima del usuario
 * @param plans - Array de planes a filtrar
 * @param userAge - Edad del usuario
 * @returns Array de planes elegibles
 */
export const filterPlansByAge = (plans: Plan[], userAge: number): Plan[] => {
  return plans.filter((plan) => plan.age >= userAge);
};

/**
 * Aplica descuento a un plan
 * @param plan - Plan al que aplicar descuento
 * @param discountRate - Tasa de descuento (por defecto 0.95 = 5% off)
 * @returns Plan con precio actualizado
 */
export const applyDiscountToPlan = (
  plan: Plan,
  discountRate: number = 0.95
): Plan => {
  return {
    ...plan,
    price: plan.price * discountRate,
  };
};

/**
 * Aplica descuento a un array de planes
 * @param plans - Array de planes
 * @param discountRate - Tasa de descuento
 * @returns Array de planes con descuento aplicado
 */
export const applyDiscountToPlans = (
  plans: Plan[],
  discountRate: number = 0.95
): Plan[] => {
  return plans.map((plan) => applyDiscountToPlan(plan, discountRate));
};

/**
 * Servicio de planes con métodos convenientes
 */
export const plansService = {
  fetchAll: fetchPlans,
  filterByAge: filterPlansByAge,
  applyDiscount: applyDiscountToPlan,
  applyDiscountToAll: applyDiscountToPlans,
};
