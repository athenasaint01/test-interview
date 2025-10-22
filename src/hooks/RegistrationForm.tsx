import { useEffect, useState } from "react";
import { useUserContext } from "../context/UserContext";
import { fetchUserData, type UserData } from "../services/userApi";

// ============================================================================
// TYPES
// ============================================================================

export interface UseFetchUserDataReturn {
  isLoading: boolean;
  error: Error | null;
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Custom hook to fetch user data from API on component mount
 *
 * @returns {UseFetchUserDataReturn} Object containing isLoading and error states
 *
 * @example
 * ```tsx
 * const { isLoading, error } = useFetchUserData();
 *
 * if (error) {
 *   console.error("Failed to load user data:", error);
 * }
 * ```
 */
export const useFetchUserData = (): UseFetchUserDataReturn => {
  const { setUserData } = useUserContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadUserData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const data: UserData = await fetchUserData();

        // Prevent state update if component unmounted or request is stale
        if (!ignore) {
          setUserData(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          const errorObject = err instanceof Error ? err : new Error(String(err));
          setError(errorObject);
          setIsLoading(false);
          console.error("Error loading user data:", errorObject);
        }
      }
    };

    loadUserData();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      ignore = true;
    };
  }, [setUserData]);

  return { isLoading, error };
};
