import React, {
  useState,
  useEffect,
  useCallback,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import { fetchUserData } from "../services/userApi";
import { Button } from "../components/ui/Button/Button"; // ← IMPORT DEL COMPONENTE
import "../styles/registrationform.scss";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface FormErrors {
  documentNumber: string;
  cellphone: string;
  privacyPolicy: string;
  commercialPolicy: string;
}

type DocumentType = "DNI" | "RUC";

// ============================================================================
// CONSTANTS
// ============================================================================

const DOCUMENT_LENGTHS: Record<DocumentType, number> = {
  DNI: 8,
  RUC: 11,
};

const CELLPHONE_LENGTH = 9;
const LOADING_DELAY = 2000;

const VALIDATION_RULES = {
  DNI_MIN_LENGTH: 7,
  RUC_MIN_LENGTH: 10,
  CELLPHONE_MIN_LENGTH: 8,
} as const;

const ERROR_MESSAGES = {
  INVALID_DOCUMENT: "*El documento ingresado no es válido",
  INVALID_CELLPHONE: "*El celular ingresado no es válido",
  DNI_LENGTH: "El DNI debe tener 8 dígitos.",
  RUC_LENGTH: "El RUC debe tener 11 dígitos.",
  CELLPHONE_LENGTH: "El celular debe tener 9 dígitos.",
  PRIVACY_REQUIRED: "Debe aceptar la política de privacidad",
  COMMERCIAL_REQUIRED: "Debe aceptar la política comercial",
} as const;

const INITIAL_ERRORS: FormErrors = {
  documentNumber: "",
  cellphone: "",
  privacyPolicy: "",
  commercialPolicy: "",
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const isNumericInput = (value: string): boolean => {
  return /^[0-9]*$/.test(value);
};

const validateDocumentLength = (type: DocumentType, value: string): string => {
  const requiredLength = DOCUMENT_LENGTHS[type];
  if (value.length !== requiredLength) {
    return type === "DNI"
      ? ERROR_MESSAGES.DNI_LENGTH
      : ERROR_MESSAGES.RUC_LENGTH;
  }
  return "";
};

const validateCellphoneLength = (value: string): string => {
  return value.length !== CELLPHONE_LENGTH
    ? ERROR_MESSAGES.CELLPHONE_LENGTH
    : "";
};

const validateFieldOnInput = (
  field: "documentNumber" | "cellphone",
  formData: any
): string => {
  if (field === "documentNumber") {
    const minLength =
      formData.documentType === "DNI"
        ? VALIDATION_RULES.DNI_MIN_LENGTH
        : VALIDATION_RULES.RUC_MIN_LENGTH;

    return formData.documentNumber.length < minLength
      ? ERROR_MESSAGES.INVALID_DOCUMENT
      : "";
  }

  if (field === "cellphone") {
    return formData.cellphone.length < VALIDATION_RULES.CELLPHONE_MIN_LENGTH
      ? ERROR_MESSAGES.INVALID_CELLPHONE
      : "";
  }

  return "";
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useFetchUserData = () => {
  const { setUserData } = useUserContext();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await fetchUserData();
        setUserData(data);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [setUserData]);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const FormSection: React.FC = () => {
  const { formData, setFormData } = useUserContext();
  const navigate = useNavigate();

  const [errors, setErrors] = useState<FormErrors>(INITIAL_ERRORS);
  const [maxLength, setMaxLength] = useState(DOCUMENT_LENGTHS.DNI);
  const [loading, setLoading] = useState(false);

  useFetchUserData();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;

      if (name === "documentNumber" || name === "cellphone") {
        if (!isNumericInput(value)) return;
      }

      if (type === "checkbox") {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: (e.target as HTMLInputElement).checked,
        }));
        return;
      }

      if (name === "documentType") {
        const documentType = value as DocumentType;
        setFormData({
          ...formData,
          documentType,
          documentNumber: "",
        });
        setMaxLength(DOCUMENT_LENGTHS[documentType]);
        return;
      }

      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    },
    [formData, setFormData]
  );

  const validateFieldOnKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement> | null, field: string) => {
      if (!e) return;

      const newErrors = { ...errors };

      if (field === "documentNumber" || field === "cellphone") {
        const error = validateFieldOnInput(
          field as "documentNumber" | "cellphone",
          formData
        );
        newErrors[field as keyof FormErrors] = error;
      }

      setErrors(newErrors);
    },
    [errors, formData]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<FormErrors> = {};

    const docError = validateDocumentLength(
      formData.documentType as DocumentType,
      formData.documentNumber
    );
    if (docError) newErrors.documentNumber = docError;

    const cellError = validateCellphoneLength(formData.cellphone);
    if (cellError) newErrors.cellphone = cellError;

    if (!formData.privacyPolicy) {
      newErrors.privacyPolicy = ERROR_MESSAGES.PRIVACY_REQUIRED;
    }

    if (!formData.commercialPolicy) {
      newErrors.commercialPolicy = ERROR_MESSAGES.COMMERCIAL_REQUIRED;
    }

    setErrors({ ...INITIAL_ERRORS, ...newErrors });
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      if (validateForm()) {
        setLoading(true);
        setTimeout(() => {
          navigate("/plans");
        }, LOADING_DELAY);
      }
    },
    [validateForm, navigate]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="form-section">
        <div className="content">
          <div className="image-container">
            <img loading="lazy"
              src="/assets/images/portada-login-desktop.webp"
              alt="Imagen de fondo"
              className="background-image"
            />
          </div>
          <div className="form-container">
            <div className="header-container">
              <div className="header-text">
                <div className="tag">Seguro Salud Flexible</div>
                <h1>Creado para ti y tu familia</h1>
              </div>
              <div className="header-image">
                <img loading="lazy"
                  src="/assets/images/portada-login-mobile.webp"
                  alt="Imagen Mobile"
                />
              </div>
            </div>

            <hr />

            <p className="subheading">
              Tú eliges cuánto pagar. Ingresa tus datos, cotiza y recibe nuestra
              asesoría. 100% online.
            </p>

            <form className="registration-form" onSubmit={handleSubmit}>
              <div className="input-group-inline">
                <select
                  id="documentType"
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleChange}
                >
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                </select>

                <div className="input-group">
                  <input
                    type="text"
                    id="documentNumber"
                    name="documentNumber"
                    placeholder=""
                    value={formData.documentNumber}
                    maxLength={maxLength}
                    onChange={handleChange}
                    onKeyDown={(e) =>
                      validateFieldOnKeyDown(e, "documentNumber")
                    }
                  />
                  <label htmlFor="documentNumber">Nro. de documento</label>
                </div>
              </div>
              {errors.documentNumber && (
                <small className="error">{errors.documentNumber}</small>
              )}

              <div className="input-group">
                <input
                  type="text"
                  id="cellphone"
                  name="cellphone"
                  placeholder=""
                  value={formData.cellphone}
                  maxLength={9}
                  onChange={handleChange}
                  onKeyDown={(e) => validateFieldOnKeyDown(e, "cellphone")}
                />
                <label htmlFor="cellphone">Celular</label>
              </div>
              {errors.cellphone && (
                <small className="error">{errors.cellphone}</small>
              )}

              <label className="checkbox-container">
                <input
                  className="custom-checkbox"
                  type="checkbox"
                  name="privacyPolicy"
                  checked={formData.privacyPolicy}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Acepto la Política de Privacidad
              </label>
              {errors.privacyPolicy && (
                <small className="error">{errors.privacyPolicy}</small>
              )}

              <label className="checkbox-container">
                <input
                  className="custom-checkbox"
                  type="checkbox"
                  name="commercialPolicy"
                  checked={formData.commercialPolicy}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Acepto la Política de Comunicaciones Comerciales
              </label>
              {errors.commercialPolicy && (
                <small className="error">{errors.commercialPolicy}</small>
              )}

              <div className="terms-and-conditions">
                <a href="#" className="terms-link">
                  Aplican Términos y Condiciones.
                </a>
              </div>

              {/* COMPONENTE BUTTON  */}
              <Button type="submit" loading={loading} loadingText="Cargando...">
                Cotiza aquí
              </Button>
              {/* ========================================== */}
            </form>
          </div>
        </div>
      </div>
      <img loading="lazy"
        className="abso r-0 t-0 select-none no-mobile"
        alt=""
        src="/assets/images/blur-right-desktop.png"
      />
      <img loading="lazy"
        className="abso r-0 t-0 select-none no-desktop"
        alt=""
        src="/assets/images/blur-right-mobile.png"
      />
      <img loading="lazy"
        className="abso l-0 b-0 select-none no-mobile"
        alt=""
        src="/assets/images/blur-left-desktop.png"
      />
      <img loading="lazy"
        className="abso l-0 b-0 select-none no-desktop"
        alt=""
        src="/assets/images/blur-left-mobile.png"
      />
    </>
  );
};

export default FormSection;
