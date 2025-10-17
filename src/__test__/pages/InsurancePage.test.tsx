import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import InsurancePage from "../../components/InsurancePage";
import { UserProvider } from "../../context/UserContext";
import * as plansApi from "../../services/plansApi";

// ============================================================================
// MOCKS
// ============================================================================

// Mock del servicio de API de planes
jest.mock("../../services/plansApi");
const mockFetchPlans = plansApi.fetchPlans as jest.MockedFunction<
  typeof plansApi.fetchPlans
>;
const mockFilterPlansByAge = plansApi.filterPlansByAge as jest.MockedFunction<
  typeof plansApi.filterPlansByAge
>;
const mockApplyDiscountToPlans =
  plansApi.applyDiscountToPlans as jest.MockedFunction<
    typeof plansApi.applyDiscountToPlans
  >;

// Mock de useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock de react-icons
jest.mock("react-icons/fa", () => ({
  FaArrowLeft: () => <div data-testid="arrow-left-icon">←</div>,
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockPlans = [
  {
    id: 1,
    name: "Plan en Casa",
    age: 18,
    price: 50.0,
    description: ["Consultas virtuales", "Medicinas a domicilio"],
  },
  {
    id: 2,
    name: "Plan en Casa y Clínica",
    age: 18,
    price: 80.0,
    description: [
      "Consultas presenciales",
      "Atención en clínica",
      "Emergencias 24/7",
    ],
  },
  {
    id: 3,
    name: "Plan en Casa + Bienestar",
    age: 25,
    price: 60.0,
    description: ["Consultas virtuales", "Descuentos en gimnasios"],
  },
];

const mockUserData = {
  name: "Juan",
  lastName: "Pérez",
  birthDay: "1990-01-01",
};

const mockFormData = {
  documentType: "DNI",
  documentNumber: "12345678",
  cellphone: "987654321",
  privacyPolicy: true,
  commercialPolicy: true,
};

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

// Mock del contexto con datos iniciales
const mockUserContext = {
  userData: mockUserData,
  formData: mockFormData,
  setUserData: jest.fn(),
  setFormData: jest.fn(),
};

jest.mock("../../context/UserContext", () => ({
  ...jest.requireActual("../../context/UserContext"),
  useUserContext: () => mockUserContext,
}));

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

beforeEach(() => {
  jest.clearAllMocks();

  // Setup default mock implementations
  mockFetchPlans.mockResolvedValue(mockPlans);
  mockFilterPlansByAge.mockImplementation((plans, age) =>
    plans.filter((plan) => plan.age <= age)
  );
  mockApplyDiscountToPlans.mockImplementation((plans, rate = 0.95) =>
    plans.map((plan) => ({ ...plan, price: plan.price * rate }))
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

// ============================================================================
// TESTS
// ============================================================================

describe("InsurancePage", () => {
  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe("Renderizado inicial", () => {
    test("debe renderizar la barra de progreso", async () => {
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(screen.getByText("Planes y coberturas")).toBeInTheDocument();
        expect(screen.getByText("Resumen")).toBeInTheDocument();
      });
    });

    test("debe renderizar el botón de volver", async () => {
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        const backButtons = screen.getAllByLabelText(/volver/i);
        expect(backButtons.length).toBeGreaterThan(0);
      });
    });

    test("debe mostrar el nombre del usuario en el encabezado", async () => {
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(
          screen.getByText(/juan.*¿para quién deseas cotizar\?/i)
        ).toBeInTheDocument();
      });
    });

    test('debe renderizar las opciones "Para mí" y "Para alguien más"', async () => {
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        const paraMiElements = screen.getAllByText(/para mí/i);
        const paraOtrosElements = screen.getAllByText(/para alguien más/i);

        expect(paraMiElements.length).toBeGreaterThan(0);
        expect(paraOtrosElements.length).toBeGreaterThan(0);
      });
    });

    test("debe cargar los planes desde la API al montar", async () => {
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ==========================================================================
  // USER OPTIONS TESTS
  // ==========================================================================

  describe("Selección de opciones de usuario", () => {
    test('debe permitir seleccionar "Para mí"', async () => {
      const user = userEvent.setup();
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(screen.getAllByText(/para mí/i).length).toBeGreaterThan(0);
      });

      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await user.click(paraMiOption);

      expect(paraMiOption).toBeChecked();
    });

    test('debe permitir seleccionar "Para alguien más"', async () => {
      const user = userEvent.setup();
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(screen.getAllByText(/para alguien más/i).length).toBeGreaterThan(
          0
        );
      });

      const paraOtrosOption = screen.getByRole("radio", {
        name: /para alguien más/i,
      });
      await user.click(paraOtrosOption);

      expect(paraOtrosOption).toBeChecked();
    });

    test("debe mostrar los planes después de seleccionar una opción", async () => {
      const user = userEvent.setup();
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalled();
      });

      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await user.click(paraMiOption);

      await waitFor(() => {
        expect(screen.getByText("Plan en Casa")).toBeInTheDocument();
        expect(screen.getByText("Plan en Casa y Clínica")).toBeInTheDocument();
      });
    });

    test('debe aplicar descuento cuando se selecciona "Para alguien más"', async () => {
      const user = userEvent.setup();
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalled();
      });

      const paraOtrosOption = screen.getByRole("radio", {
        name: /para alguien más/i,
      });
      await user.click(paraOtrosOption);

      await waitFor(() => {
        expect(mockApplyDiscountToPlans).toHaveBeenCalled();
      });
    });
  });

  // ==========================================================================
  // PLANS DISPLAY TESTS
  // ==========================================================================

  describe("Visualización de planes", () => {
    test("debe mostrar el estado de carga mientras obtiene planes", async () => {
      mockFetchPlans.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockPlans), 100))
      );

      renderWithProviders(<InsurancePage />);

      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await userEvent.click(paraMiOption);

      expect(screen.getByText(/cargando planes/i)).toBeInTheDocument();

      await waitFor(
        () => {
          expect(
            screen.queryByText(/cargando planes/i)
          ).not.toBeInTheDocument();
        },
        { timeout: 200 }
      );
    });

    test("debe mostrar error si falla la carga de planes", async () => {
      const user = userEvent.setup();
      mockFetchPlans.mockRejectedValueOnce(new Error("Error de red"));

      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalled();
      });

      // Seleccionar una opción para que se muestre el error
      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await user.click(paraMiOption);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });

    test("debe mostrar mensaje cuando no hay planes disponibles", async () => {
      mockFetchPlans.mockResolvedValueOnce([]);
      mockFilterPlansByAge.mockReturnValueOnce([]);

      renderWithProviders(<InsurancePage />);

      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await userEvent.click(paraMiOption);

      await waitFor(() => {
        expect(
          screen.getByText(/no hay planes disponibles/i)
        ).toBeInTheDocument();
      });
    });

    test('debe mostrar el tag "Plan recomendado" en el plan correcto', async () => {
      const user = userEvent.setup();
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalled();
      });

      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await user.click(paraMiOption);

      await waitFor(() => {
        expect(screen.getByText("Plan recomendado")).toBeInTheDocument();
      });
    });

    test("debe mostrar la descripción de cada plan", async () => {
      const user = userEvent.setup();
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalled();
      });

      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await user.click(paraMiOption);

      await waitFor(() => {
        // Usar getAllByText para textos que aparecen múltiples veces
        const consultasVirtuales = screen.getAllByText("Consultas virtuales");
        expect(consultasVirtuales.length).toBeGreaterThan(0);

        // Usar getByText para textos únicos
        expect(screen.getByText("Emergencias 24/7")).toBeInTheDocument();
        expect(screen.getByText("Medicinas a domicilio")).toBeInTheDocument();
        expect(screen.getByText("Descuentos en gimnasios")).toBeInTheDocument();
      });
    });

    test("debe mostrar el precio correcto de cada plan", async () => {
      const user = userEvent.setup();
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalled();
      });

      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await user.click(paraMiOption);

      await waitFor(() => {
        expect(screen.getByText(/\$50\.00 al mes/i)).toBeInTheDocument();
        expect(screen.getByText(/\$80\.00 al mes/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // PLAN SELECTION TESTS
  // ==========================================================================

  describe("Selección de plan", () => {
    test("debe permitir seleccionar un plan", async () => {
      const user = userEvent.setup();
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalled();
      });

      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await user.click(paraMiOption);

      await waitFor(() => {
        expect(screen.getByText("Plan en Casa")).toBeInTheDocument();
      });

      const selectButtons = screen.getAllByRole("button", {
        name: /seleccionar plan/i,
      });
      await user.click(selectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Resumen del Seguro")).toBeInTheDocument();
      });
    });

    test("debe cambiar al paso 2 después de seleccionar un plan", async () => {
      const user = userEvent.setup();
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalled();
      });

      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await user.click(paraMiOption);

      await waitFor(() => {
        expect(screen.getByText("Plan en Casa")).toBeInTheDocument();
      });

      const selectButtons = screen.getAllByRole("button", {
        name: /seleccionar plan/i,
      });
      await user.click(selectButtons[0]);

      await waitFor(() => {
        const step2Circle = screen.getAllByText("2")[0];
        expect(step2Circle.closest(".step")).toHaveClass("active");
      });
    });
  });

  // ==========================================================================
  // SUMMARY PAGE TESTS
  // ==========================================================================

  describe("Página de resumen", () => {
    const setupSummaryPage = async () => {
      const user = userEvent.setup();
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalled();
      });

      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await user.click(paraMiOption);

      await waitFor(() => {
        expect(screen.getByText("Plan en Casa")).toBeInTheDocument();
      });

      const selectButtons = screen.getAllByRole("button", {
        name: /seleccionar plan/i,
      });
      await user.click(selectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Resumen del Seguro")).toBeInTheDocument();
      });

      return user;
    };

    test("debe mostrar el resumen del plan seleccionado", async () => {
      await setupSummaryPage();

      expect(screen.getByText("Resumen del Seguro")).toBeInTheDocument();
      expect(screen.getByText(/precios calculados para:/i)).toBeInTheDocument();
    });

    test("debe mostrar los datos del usuario en el resumen", async () => {
      await setupSummaryPage();

      expect(screen.getByText(/juan pérez/i)).toBeInTheDocument();
    });

    test("debe mostrar el DNI del responsable de pago", async () => {
      await setupSummaryPage();

      expect(screen.getByText(/dni: 12345678/i)).toBeInTheDocument();
    });

    test("debe mostrar el celular del responsable de pago", async () => {
      await setupSummaryPage();

      expect(screen.getByText(/celular: 987654321/i)).toBeInTheDocument();
    });

    test("debe mostrar el nombre del plan elegido", async () => {
      await setupSummaryPage();

      expect(screen.getByText("Plan en Casa")).toBeInTheDocument();
    });

    test("debe mostrar el costo del plan en el resumen", async () => {
      await setupSummaryPage();

      expect(
        screen.getByText(/costo del plan.*\$50\.00 al mes/i)
      ).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // NAVIGATION TESTS
  // ==========================================================================

  describe("Navegación", () => {
    test("debe navegar al home al hacer clic en volver desde el paso 1", async () => {
      const user = userEvent.setup();
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(screen.getAllByLabelText(/volver/i).length).toBeGreaterThan(0);
      });

      const backButton = screen.getAllByLabelText(/volver/i)[0];
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    test("debe volver al paso 1 al hacer clic en volver desde el paso 2", async () => {
      const user = userEvent.setup();
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalled();
      });

      // Ir al paso 2
      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await user.click(paraMiOption);

      await waitFor(() => {
        expect(screen.getByText("Plan en Casa")).toBeInTheDocument();
      });

      const selectButtons = screen.getAllByRole("button", {
        name: /seleccionar plan/i,
      });
      await user.click(selectButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Resumen del Seguro")).toBeInTheDocument();
      });

      // Volver al paso 1
      const backButton = screen.getAllByLabelText(/volver/i)[0];
      await user.click(backButton);

      await waitFor(() => {
        expect(
          screen.getByText(/¿para quién deseas cotizar\?/i)
        ).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // SLIDER TESTS
  // ==========================================================================

  describe("Slider de planes", () => {
    test("debe renderizar los botones del slider", async () => {
      const user = userEvent.setup();
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalled();
      });

      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await user.click(paraMiOption);

      await waitFor(() => {
        const prevButton = screen.getByLabelText(/ver planes anteriores/i);
        const nextButton = screen.getByLabelText(/ver más planes/i);

        expect(prevButton).toBeInTheDocument();
        expect(nextButton).toBeInTheDocument();
      });
    });

    test("el botón anterior debe estar deshabilitado al inicio", async () => {
      const user = userEvent.setup();
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalled();
      });

      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await user.click(paraMiOption);

      await waitFor(() => {
        const prevButton = screen.getByLabelText(/ver planes anteriores/i);
        expect(prevButton).toBeDisabled();
      });
    });
  });

  // ==========================================================================
  // ACCESSIBILITY TESTS
  // ==========================================================================

  describe("Accesibilidad", () => {
    test("debe tener navegación con aria-label", async () => {
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(
          screen.getByLabelText(/progreso de cotización/i)
        ).toBeInTheDocument();
      });
    });

    test("debe tener sections con aria-label", async () => {
      const user = userEvent.setup();
      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalled();
      });

      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await user.click(paraMiOption);

      await waitFor(() => {
        expect(
          screen.getByLabelText(/lista de planes disponibles/i)
        ).toBeInTheDocument();
      });
    });

    test('debe usar role="status" para mensajes de carga', async () => {
      mockFetchPlans.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockPlans), 100))
      );

      renderWithProviders(<InsurancePage />);

      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await userEvent.click(paraMiOption);

      const loadingStatus = screen.getByRole("status");
      expect(loadingStatus).toHaveTextContent(/cargando planes/i);
    });

    test('debe usar role="alert" para mensajes de error', async () => {
      const user = userEvent.setup();
      mockFetchPlans.mockRejectedValueOnce(new Error("Error de red"));

      renderWithProviders(<InsurancePage />);

      // Esperar a que se intente cargar los planes y falle
      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalled();
      });

      // Seleccionar una opción para que se muestre la sección de planes con el error
      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await user.click(paraMiOption);

      await waitFor(() => {
        const alert = screen.getByRole("alert");
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent(/error/i);
      });
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe("Casos extremos", () => {
    test("debe manejar edad 0 correctamente", async () => {
      const contextWithNoAge = {
        ...mockUserContext,
        userData: { ...mockUserData, birthDay: "" },
      };

      jest
        .spyOn(require("../../context/UserContext"), "useUserContext")
        .mockReturnValue(contextWithNoAge);

      // Asegurar que el mock devuelve planes incluso con edad 0
      mockFilterPlansByAge.mockReturnValueOnce(mockPlans);

      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalled();
      });

      // Verificar que se puede continuar con el flujo
      expect(
        screen.getByText(/¿para quién deseas cotizar\?/i)
      ).toBeInTheDocument();
    });

    test("debe manejar lista vacía de planes", async () => {
      mockFetchPlans.mockResolvedValueOnce([]);
      mockFilterPlansByAge.mockReturnValueOnce([]);

      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalled();
      });

      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await userEvent.click(paraMiOption);

      await waitFor(() => {
        expect(
          screen.getByText(/no hay planes disponibles/i)
        ).toBeInTheDocument();
      });
    });

    test("debe manejar planes sin descripción", async () => {
      const plansWithoutDescription = mockPlans.map((plan) => ({
        ...plan,
        description: undefined,
      }));

      mockFetchPlans.mockResolvedValueOnce(plansWithoutDescription);
      mockFilterPlansByAge.mockReturnValueOnce(plansWithoutDescription);

      renderWithProviders(<InsurancePage />);

      await waitFor(() => {
        expect(mockFetchPlans).toHaveBeenCalled();
      });

      const paraMiOption = screen.getByRole("radio", { name: /para mí/i });
      await userEvent.click(paraMiOption);

      await waitFor(() => {
        expect(screen.getByText("Plan en Casa")).toBeInTheDocument();
      });

      // Verificar que se renderizan sin descripción
      const planCards = screen.getAllByRole("article");
      expect(planCards.length).toBeGreaterThan(0);
    });
  });
});
