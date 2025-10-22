import React, {
  useState,
  useCallback,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Button } from "../Button/Button";
import "./Form.scss";

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

export interface RegistrationFormData {
  documentType: DocumentType;
  documentNumber: string;
  cellphone: string;
  privacyPolicy: boolean;
  commercialPolicy: boolean;
}

interface RegistrationFormProps {
  initialData?: Partial<RegistrationFormData>;
  onSubmit: (data: RegistrationFormData) => void | Promise<void>;
  submitButtonText?: string;
  loadingText?: string;
  showTermsLink?: boolean;
  termsLinkText?: string;
  termsLinkHref?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DOCUMENT_LENGTHS: Record<DocumentType, number> = {
  DNI: 8,
  RUC: 11,
};

const CELLPHONE_LENGTH = 9;

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

const DEFAULT_FORM_DATA: RegistrationFormData = {
  documentType: "DNI",
  documentNumber: "",
  cellphone: "",
  privacyPolicy: false,
  commercialPolicy: false,
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
  formData: RegistrationFormData
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
// MAIN COMPONENT
// ============================================================================

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  initialData = {},
  onSubmit,
  submitButtonText = "Cotiza aquí",
  loadingText = "Cargando...",
  showTermsLink = true,
  termsLinkText = "Aplican Términos y Condiciones.",
  termsLinkHref = "#",
}) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  });
  const [errors, setErrors] = useState<FormErrors>(INITIAL_ERRORS);
  const [maxLength, setMaxLength] = useState(
    DOCUMENT_LENGTHS[formData.documentType]
  );
  const [loading, setLoading] = useState(false);

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
    [formData]
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
      formData.documentType,
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
    async (e: FormEvent) => {
      e.preventDefault();

      if (validateForm()) {
        setLoading(true);
        try {
          await onSubmit(formData);
        } catch (error) {
          console.error("Error submitting form:", error);
        } finally {
          setLoading(false);
        }
      }
    },
    [validateForm, formData, onSubmit]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
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
            onKeyDown={(e) => validateFieldOnKeyDown(e, "documentNumber")}
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
      {errors.cellphone && <small className="error">{errors.cellphone}</small>}

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

      {showTermsLink && (
        <div className="terms-and-conditions">
          <a href={termsLinkHref} className="terms-link">
            {termsLinkText}
          </a>
        </div>
      )}

      <Button type="submit" loading={loading} loadingText={loadingText}>
        {submitButtonText}
      </Button>
    </form>
  );
};