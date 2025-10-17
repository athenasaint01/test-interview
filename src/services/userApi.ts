// ============================================================================
// USER API SERVICE
// ============================================================================

/**
 * Interface para la respuesta de la API de usuario
 */
export interface UserApiResponse {
  name: string;
  lastName: string;
  birthDay: string;
}

/**
 * Interface para los datos de usuario procesados
 */
export interface UserData {
  name: string;
  lastName: string;
  birthDay: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const USER_API_URL = "https://rimac-front-end-challenge.netlify.app/api/user.json";

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Obtiene los datos del usuario desde la API
 * @returns Promise con los datos del usuario
 * @throws Error si la petición falla
 */
export const fetchUserData = async (): Promise<UserData> => {
  try {
    const response = await fetch(USER_API_URL);

    if (!response.ok) {
      throw new Error(
        `HTTP Error: ${response.status} - ${response.statusText}`
      );
    }

    const data: UserApiResponse = await response.json();

    // Validar que la respuesta tenga los campos requeridos
    if (!data.name || !data.lastName || !data.birthDay) {
      throw new Error("Respuesta de API inválida: faltan campos requeridos");
    }

    return {
      name: data.name,
      lastName: data.lastName,
      birthDay: data.birthDay,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

/**
 * Hook wrapper para usar el servicio de API en componentes React
 * (Opcional: puedes mantener esta lógica en el componente si prefieres)
 */
export const getUserDataService = {
  fetch: fetchUserData,
};
