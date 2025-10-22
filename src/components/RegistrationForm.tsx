import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import {
  RegistrationForm,
  type RegistrationFormData,
} from "../components/ui/Form/Form";
import { useFetchUserData } from "../hooks/RegistrationForm";
import { LOADING_DELAY } from "../constants/RegistrationForm";
import "../styles/registrationform.scss";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FormSection() {
  const { setFormData } = useUserContext();
  const navigate = useNavigate();

  // Fetch user data with loading and error states
  const { isLoading: isLoadingUserData, error: userDataError } = useFetchUserData();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFormSubmit = useCallback(
    async (data: RegistrationFormData): Promise<void> => {
      // Save form data to context
      setFormData(data);

      // Simulate loading delay before navigation
      await new Promise((resolve) => setTimeout(resolve, LOADING_DELAY));

      // Navigate to plans page
      navigate("/plans");
    },
    [setFormData, navigate]
  );

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  // Show error message if user data fetch failed (optional enhancement)
  if (userDataError) {
    console.warn("Failed to load user data, form will still be functional:", userDataError);
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="form-section">
        <div className="content">
          {/* Hero Image */}
          <div className="image-container">
            <img
              loading="lazy"
              src="/assets/images/portada-login-desktop.webp"
              alt="Imagen Principal - Seguro de Salud"
              className="background-image"
            />
          </div>

          {/* Form Container */}
          <div className="form-container">
            <div className="header-container">
              {/* Header Text */}
              <div className="header-text">
                <div className="tag">Seguro Salud Flexible</div>
                <h1>Creado para ti y tu familia</h1>
              </div>

              {/* Mobile Banner Image */}
              <div className="header-image">
                <img
                  loading="lazy"
                  src="/assets/images/portada-login-mobile.webp"
                  alt="Banner Mobile - Seguro de Salud"
                />
              </div>
            </div>

            <hr />

            {/* Subheading */}
            <p className="subheading">
              Tú eliges cuánto pagar. Ingresa tus datos, cotiza y recibe nuestra
              asesoría. 100% online.
            </p>

            {/* Registration Form Component */}
            <RegistrationForm
              onSubmit={handleFormSubmit}
              submitButtonText="Cotiza aquí"
              loadingText="Cargando..."
            />
          </div>
        </div>
      </div>

      {/* Decorative Background Blur Images */}
      <img
        loading="lazy"
        className="abso r-0 t-0 select-none no-mobile"
        alt=""
        src="/assets/images/blur-right-desktop.png"
      />
      <img
        loading="lazy"
        className="abso r-0 t-0 select-none no-desktop"
        alt=""
        src="/assets/images/blur-right-mobile.png"
      />
      <img
        loading="lazy"
        className="abso l-0 b-0 select-none no-mobile"
        alt=""
        src="/assets/images/blur-left-desktop.png"
      />
      <img
        loading="lazy"
        className="abso l-0 b-0 select-none no-desktop"
        alt=""
        src="/assets/images/blur-left-mobile.png"
      />
    </>
  );
}
