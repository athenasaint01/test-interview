import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import FormSection from "../../components/RegistrationForm";
import { UserProvider } from "../../context/UserContext";
import * as userApi from "../../services/userApi";

// ============================================================================
// MOCKS
// ============================================================================

// Mock del servicio de API
jest.mock("../../services/userApi");
const mockFetchUserData = userApi.fetchUserData as jest.MockedFunction<
  typeof userApi.fetchUserData
>;

// Mock de useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// ============================================================================
// HELPERS
// ============================================================================

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <UserProvider>{component}</UserProvider>
    </BrowserRouter>
  );
};

const mockUserData = {
  name: "Juan",
  lastName: "Pérez",
  birthDay: "1990-01-01",
};

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

beforeEach(() => {
  jest.clearAllMocks();
  mockFetchUserData.mockResolvedValue(mockUserData);
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// ============================================================================
// TESTS
// ============================================================================

describe("RegistrationForm", () => {
  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe("Renderizado inicial", () => {
    test("debe renderizar todos los elementos del formulario", () => {
      renderWithProviders(<FormSection />);

      expect(screen.getByText("Seguro Salud Flexible")).toBeInTheDocument();
      expect(
        screen.getByText("Creado para ti y tu familia")
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/nro. de documento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/celular/i)).toBeInTheDocument();
      expect(
        screen.getByText(/acepto la política de privacidad/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/acepto la política de comunicaciones comerciales/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cotiza aquí/i })
      ).toBeInTheDocument();
    });

    test("debe cargar los datos del usuario desde la API", async () => {
      renderWithProviders(<FormSection />);

      await waitFor(() => {
        expect(mockFetchUserData).toHaveBeenCalledTimes(1);
      });
    });

    test("debe renderizar las imágenes de fondo", () => {
      renderWithProviders(<FormSection />);

      const images = screen.getAllByRole("img");
      expect(images.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // DOCUMENT TYPE TESTS
  // ==========================================================================

  describe("Tipo de documento", () => {
    test("debe mostrar DNI como opción por defecto", () => {
      renderWithProviders(<FormSection />);

      const select = screen.getByRole("combobox");
      expect(select).toHaveValue("DNI");
    });

    test("debe cambiar a RUC cuando se selecciona", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "RUC");

      expect(select).toHaveValue("RUC");
    });

    test("debe limpiar el número de documento al cambiar tipo", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const documentInput = screen.getByLabelText(/nro. de documento/i);
      await user.type(documentInput, "12345678");

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "RUC");

      expect(documentInput).toHaveValue("");
    });
  });

  // ==========================================================================
  // DOCUMENT NUMBER VALIDATION TESTS
  // ==========================================================================

  describe("Validación del número de documento", () => {
    test("debe aceptar solo números en el campo de documento", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const documentInput = screen.getByLabelText(/nro. de documento/i);
      await user.type(documentInput, "abc123");

      expect(documentInput).toHaveValue("123");
    });

    test("debe limitar DNI a 8 dígitos", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const documentInput = screen.getByLabelText(/nro. de documento/i);
      await user.type(documentInput, "123456789");

      expect(documentInput).toHaveValue("12345678");
    });

    test("debe limitar RUC a 11 dígitos", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "RUC");

      const documentInput = screen.getByLabelText(/nro. de documento/i);
      await user.type(documentInput, "123456789012");

      expect(documentInput).toHaveValue("12345678901");
    });

    test("debe mostrar error si DNI tiene menos de 8 dígitos al submit", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const documentInput = screen.getByLabelText(/nro. de documento/i);
      const cellphoneInput = screen.getByLabelText(/celular/i);
      const privacyCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de privacidad/i,
      });
      const commercialCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de comunicaciones comerciales/i,
      });
      const submitButton = screen.getByRole("button", { name: /cotiza aquí/i });

      await user.type(documentInput, "1234567");
      await user.type(cellphoneInput, "987654321");
      await user.click(privacyCheckbox);
      await user.click(commercialCheckbox);
      await user.click(submitButton);

      expect(
        await screen.findByText(/el dni debe tener 8 dígitos/i)
      ).toBeInTheDocument();
    });

    test("debe mostrar error si RUC tiene menos de 11 dígitos al submit", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "RUC");

      const documentInput = screen.getByLabelText(/nro. de documento/i);
      const cellphoneInput = screen.getByLabelText(/celular/i);
      const privacyCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de privacidad/i,
      });
      const commercialCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de comunicaciones comerciales/i,
      });
      const submitButton = screen.getByRole("button", { name: /cotiza aquí/i });

      await user.type(documentInput, "1234567890");
      await user.type(cellphoneInput, "987654321");
      await user.click(privacyCheckbox);
      await user.click(commercialCheckbox);
      await user.click(submitButton);

      expect(
        await screen.findByText(/el ruc debe tener 11 dígitos/i)
      ).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // CELLPHONE VALIDATION TESTS
  // ==========================================================================

  describe("Validación del celular", () => {
    test("debe aceptar solo números en el campo de celular", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const cellphoneInput = screen.getByLabelText(/celular/i);
      await user.type(cellphoneInput, "abc987654321");

      expect(cellphoneInput).toHaveValue("987654321");
    });

    test("debe limitar el celular a 9 dígitos", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const cellphoneInput = screen.getByLabelText(/celular/i);
      await user.type(cellphoneInput, "9876543210");

      expect(cellphoneInput).toHaveValue("987654321");
    });

    test("debe mostrar error si el celular tiene menos de 9 dígitos al submit", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const documentInput = screen.getByLabelText(/nro. de documento/i);
      const cellphoneInput = screen.getByLabelText(/celular/i);
      const privacyCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de privacidad/i,
      });
      const commercialCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de comunicaciones comerciales/i,
      });
      const submitButton = screen.getByRole("button", { name: /cotiza aquí/i });

      await user.type(documentInput, "12345678");
      await user.type(cellphoneInput, "98765432");
      await user.click(privacyCheckbox);
      await user.click(commercialCheckbox);
      await user.click(submitButton);

      expect(
        await screen.findByText(/el celular debe tener 9 dígitos/i)
      ).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // CHECKBOX VALIDATION TESTS
  // ==========================================================================

  describe("Validación de checkboxes", () => {
    test("debe permitir marcar las políticas", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const privacyCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de privacidad/i,
      });
      const commercialCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de comunicaciones comerciales/i,
      });

      await user.click(privacyCheckbox);
      await user.click(commercialCheckbox);

      expect(privacyCheckbox).toBeChecked();
      expect(commercialCheckbox).toBeChecked();
    });

    test("debe mostrar error si no se acepta la política de privacidad", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const documentInput = screen.getByLabelText(/nro. de documento/i);
      const cellphoneInput = screen.getByLabelText(/celular/i);
      const commercialCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de comunicaciones comerciales/i,
      });
      const submitButton = screen.getByRole("button", { name: /cotiza aquí/i });

      await user.type(documentInput, "12345678");
      await user.type(cellphoneInput, "987654321");
      await user.click(commercialCheckbox);
      await user.click(submitButton);

      expect(
        await screen.findByText(/debe aceptar la política de privacidad/i)
      ).toBeInTheDocument();
    });

    test("debe mostrar error si no se acepta la política comercial", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const documentInput = screen.getByLabelText(/nro. de documento/i);
      const cellphoneInput = screen.getByLabelText(/celular/i);
      const privacyCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de privacidad/i,
      });
      const submitButton = screen.getByRole("button", { name: /cotiza aquí/i });

      await user.type(documentInput, "12345678");
      await user.type(cellphoneInput, "987654321");
      await user.click(privacyCheckbox);
      await user.click(submitButton);

      expect(
        await screen.findByText(/debe aceptar la política comercial/i)
      ).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // FORM SUBMISSION TESTS
  // ==========================================================================

  describe("Envío del formulario", () => {
    test("debe enviar el formulario con datos válidos", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const documentInput = screen.getByLabelText(/nro. de documento/i);
      const cellphoneInput = screen.getByLabelText(/celular/i);
      const privacyCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de privacidad/i,
      });
      const commercialCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de comunicaciones comerciales/i,
      });
      const submitButton = screen.getByRole("button", { name: /cotiza aquí/i });

      await user.type(documentInput, "12345678");
      await user.type(cellphoneInput, "987654321");
      await user.click(privacyCheckbox);
      await user.click(commercialCheckbox);
      await user.click(submitButton);

      // Verificar que no hay errores
      await waitFor(() => {
        expect(
          screen.queryByText(/el dni debe tener 8 dígitos/i)
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(/el celular debe tener 9 dígitos/i)
        ).not.toBeInTheDocument();
      });
    });

    test("debe mostrar estado de carga al enviar", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const documentInput = screen.getByLabelText(/nro. de documento/i);
      const cellphoneInput = screen.getByLabelText(/celular/i);
      const privacyCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de privacidad/i,
      });
      const commercialCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de comunicaciones comerciales/i,
      });
      const submitButton = screen.getByRole("button", { name: /cotiza aquí/i });

      await user.type(documentInput, "12345678");
      await user.type(cellphoneInput, "987654321");
      await user.click(privacyCheckbox);
      await user.click(commercialCheckbox);
      await user.click(submitButton);

      expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });

    test("debe deshabilitar el botón mientras está cargando", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const documentInput = screen.getByLabelText(/nro. de documento/i);
      const cellphoneInput = screen.getByLabelText(/celular/i);
      const privacyCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de privacidad/i,
      });
      const commercialCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de comunicaciones comerciales/i,
      });
      const submitButton = screen.getByRole("button", { name: /cotiza aquí/i });

      await user.type(documentInput, "12345678");
      await user.type(cellphoneInput, "987654321");
      await user.click(privacyCheckbox);
      await user.click(commercialCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });

    test("debe navegar a /plans después del envío exitoso", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const documentInput = screen.getByLabelText(/nro. de documento/i);
      const cellphoneInput = screen.getByLabelText(/celular/i);
      const privacyCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de privacidad/i,
      });
      const commercialCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de comunicaciones comerciales/i,
      });
      const submitButton = screen.getByRole("button", { name: /cotiza aquí/i });

      await user.type(documentInput, "12345678");
      await user.type(cellphoneInput, "987654321");
      await user.click(privacyCheckbox);
      await user.click(commercialCheckbox);
      await user.click(submitButton);

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/plans");
      });
    });

    test("no debe enviar el formulario si hay errores de validación", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const submitButton = screen.getByRole("button", { name: /cotiza aquí/i });
      await user.click(submitButton);

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  // ==========================================================================
  // API ERROR HANDLING TESTS
  // ==========================================================================

  describe("Manejo de errores de API", () => {
    test("debe manejar errores al cargar datos del usuario", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockFetchUserData.mockRejectedValueOnce(new Error("API Error"));

      renderWithProviders(<FormSection />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error loading user data:",
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  // ==========================================================================
  // ACCESSIBILITY TESTS
  // ==========================================================================

  describe("Accesibilidad", () => {
    test("debe tener labels asociados a los inputs", () => {
      renderWithProviders(<FormSection />);

      const documentInput = screen.getByLabelText(/nro. de documento/i);
      const cellphoneInput = screen.getByLabelText(/celular/i);

      expect(documentInput).toBeInTheDocument();
      expect(cellphoneInput).toBeInTheDocument();
    });

    test("debe tener aria-busy en el botón cuando está cargando", async () => {
      const user = userEvent.setup({ delay: null });
      renderWithProviders(<FormSection />);

      const documentInput = screen.getByLabelText(/nro. de documento/i);
      const cellphoneInput = screen.getByLabelText(/celular/i);
      const privacyCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de privacidad/i,
      });
      const commercialCheckbox = screen.getByRole("checkbox", {
        name: /acepto la política de comunicaciones comerciales/i,
      });
      const submitButton = screen.getByRole("button", { name: /cotiza aquí/i });

      await user.type(documentInput, "12345678");
      await user.type(cellphoneInput, "987654321");
      await user.click(privacyCheckbox);
      await user.click(commercialCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toHaveAttribute("aria-busy", "true");
      });
    });
  });
});
