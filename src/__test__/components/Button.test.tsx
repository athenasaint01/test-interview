import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../../components/ui/Button/Button";

// ============================================================================
// TESTS
// ============================================================================

describe("Button Component", () => {
  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe("Renderizado básico", () => {
    test("debe renderizar el botón con el texto proporcionado", () => {
      render(<Button>Haz clic aquí</Button>);

      expect(
        screen.getByRole("button", { name: /haz clic aquí/i })
      ).toBeInTheDocument();
    });

    test('debe renderizar como botón por defecto (type="button")', () => {
      render(<Button>Click</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });

    test('debe renderizar con type="submit" cuando se especifica', () => {
      render(<Button type="submit">Enviar</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
    });

    test("debe aplicar clases CSS personalizadas", () => {
      render(<Button className="custom-class">Botón</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    test("debe renderizar elementos hijos complejos", () => {
      render(
        <Button>
          <span>Icono</span>
          <span>Texto</span>
        </Button>
      );

      expect(screen.getByText("Icono")).toBeInTheDocument();
      expect(screen.getByText("Texto")).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // LOADING STATE TESTS
  // ==========================================================================

  describe("Estado de carga", () => {
    test("debe mostrar el estado de carga cuando loading es true", () => {
      render(<Button loading>Enviar</Button>);

      expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });

    test("debe mostrar texto de carga personalizado", () => {
      render(
        <Button loading loadingText="Procesando...">
          Enviar
        </Button>
      );

      expect(screen.getByText("Procesando...")).toBeInTheDocument();
    });

    test("debe ocultar el children cuando está en loading", () => {
      render(<Button loading>Texto Original</Button>);

      expect(screen.queryByText("Texto Original")).not.toBeInTheDocument();
    });

    test("debe mostrar el spinner con aria-hidden", () => {
      render(<Button loading>Enviar</Button>);

      const loader = screen.getByText(/cargando/i).previousSibling;
      expect(loader).toHaveAttribute("aria-hidden", "true");
    });

    test("debe tener la clase loading-container en estado de carga", () => {
      render(<Button loading>Enviar</Button>);

      const loadingContainer = screen.getByText(/cargando/i).parentElement;
      expect(loadingContainer).toHaveClass("loading-container");
    });

    test("debe tener la clase loader en el spinner", () => {
      const { container } = render(<Button loading>Enviar</Button>);

      const loader = container.querySelector(".loader");
      expect(loader).toBeInTheDocument();
    });

    test("debe tener la clase loading-text en el texto de carga", () => {
      render(<Button loading>Enviar</Button>);

      const loadingText = screen.getByText(/cargando/i);
      expect(loadingText).toHaveClass("loading-text");
    });
  });

  // ==========================================================================
  // DISABLED STATE TESTS
  // ==========================================================================

  describe("Estado deshabilitado", () => {
    test("debe deshabilitar el botón cuando disabled es true", () => {
      render(<Button disabled>Enviar</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    test("debe deshabilitar el botón cuando loading es true", () => {
      render(<Button loading>Enviar</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    test("debe deshabilitar el botón cuando ambos disabled y loading son true", () => {
      render(
        <Button disabled loading>
          Enviar
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    test("no debe estar deshabilitado por defecto", () => {
      render(<Button>Enviar</Button>);

      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });
  });

  // ==========================================================================
  // ARIA ATTRIBUTES TESTS
  // ==========================================================================

  describe("Atributos ARIA", () => {
    test('debe tener aria-busy="true" cuando está en loading', () => {
      render(<Button loading>Enviar</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-busy", "true");
    });

    test('debe tener aria-busy="false" cuando no está en loading', () => {
      render(<Button loading={false}>Enviar</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-busy", "false");
    });

    test("no debe tener aria-busy cuando loading es undefined", () => {
      render(<Button>Enviar</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-busy", "false");
    });
  });

  // ==========================================================================
  // EVENT HANDLING TESTS
  // ==========================================================================

  describe("Manejo de eventos", () => {
    test("debe ejecutar onClick cuando se hace clic", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click</Button>);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test("no debe ejecutar onClick cuando está deshabilitado", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} disabled>
          Click
        </Button>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    test("no debe ejecutar onClick cuando está en loading", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} loading>
          Click
        </Button>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    test("debe pasar el evento al handler", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click</Button>);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    test("debe manejar múltiples clics", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click</Button>);

      const button = screen.getByRole("button");
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  // ==========================================================================
  // PROPS SPREADING TESTS
  // ==========================================================================

  describe("Propagación de props", () => {
    test("debe aceptar props HTML nativas del botón", () => {
      render(
        <Button id="test-button" name="submit-btn" data-testid="custom-button">
          Botón
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("id", "test-button");
      expect(button).toHaveAttribute("name", "submit-btn");
      expect(button).toHaveAttribute("data-testid", "custom-button");
    });

    test("debe aceptar aria-label personalizado", () => {
      render(<Button aria-label="Cerrar modal">X</Button>);

      const button = screen.getByLabelText("Cerrar modal");
      expect(button).toBeInTheDocument();
    });

    test("debe aceptar title personalizado", () => {
      render(<Button title="Haz clic para enviar">Enviar</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title", "Haz clic para enviar");
    });

    test("debe aceptar data attributes", () => {
      render(<Button data-analytics="submit-form">Enviar</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-analytics", "submit-form");
    });
  });

  // ==========================================================================
  // INTEGRATION TESTS
  // ==========================================================================

  describe("Casos de integración", () => {
    test("debe cambiar de normal a loading", () => {
      const { rerender } = render(<Button>Enviar</Button>);

      expect(screen.getByText("Enviar")).toBeInTheDocument();

      rerender(<Button loading>Enviar</Button>);

      expect(screen.queryByText("Enviar")).not.toBeInTheDocument();
      expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });

    test("debe cambiar de loading a normal", () => {
      const { rerender } = render(<Button loading>Enviar</Button>);

      expect(screen.getByText(/cargando/i)).toBeInTheDocument();

      rerender(<Button loading={false}>Enviar</Button>);

      expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
      expect(screen.getByText("Enviar")).toBeInTheDocument();
    });

    test("debe funcionar en un formulario", () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Enviar formulario</Button>
        </form>
      );

      const button = screen.getByRole("button");
      button.click();

      expect(handleSubmit).toHaveBeenCalled();
    });

    test("debe prevenir submit cuando está en loading", () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit" loading>
            Enviar
          </Button>
        </form>
      );

      const button = screen.getByRole("button");
      button.click();

      // No debe llamarse porque el botón está deshabilitado
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe("Casos extremos", () => {
    test("debe manejar children como null", () => {
      render(<Button>{null}</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    test("debe manejar children como undefined", () => {
      render(<Button>{undefined}</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    test("debe manejar children como número", () => {
      render(<Button>{42}</Button>);

      expect(screen.getByText("42")).toBeInTheDocument();
    });

    test("debe manejar className vacío", () => {
      render(<Button className="">Botón</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    test("debe manejar loadingText vacío", () => {
      render(
        <Button loading loadingText="">
          Enviar
        </Button>
      );

      const loadingContainer = screen
        .getByRole("button")
        .querySelector(".loading-container");
      expect(loadingContainer).toBeInTheDocument();
    });

    test("debe manejar cambios rápidos de loading", () => {
      const { rerender } = render(<Button>Enviar</Button>);

      rerender(<Button loading>Enviar</Button>);
      rerender(<Button loading={false}>Enviar</Button>);
      rerender(<Button loading>Enviar</Button>);
      rerender(<Button loading={false}>Enviar</Button>);

      expect(screen.getByText("Enviar")).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // ACCESSIBILITY TESTS
  // ==========================================================================

  describe("Accesibilidad", () => {
    test("debe ser accesible con lector de pantalla", () => {
      render(<Button>Enviar formulario</Button>);

      const button = screen.getByRole("button", { name: /enviar formulario/i });
      expect(button).toBeInTheDocument();
    });

    test("debe ser accesible en estado de carga", () => {
      render(<Button loading>Enviar</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toBeDisabled();
    });

    test("debe ocultar el spinner del lector de pantalla", () => {
      render(<Button loading>Enviar</Button>);

      const loader = screen.getByRole("button").querySelector(".loader");
      expect(loader).toHaveAttribute("aria-hidden", "true");
    });

    test("debe ser navegable por teclado", () => {
      render(<Button>Click</Button>);

      const button = screen.getByRole("button");
      button.focus();

      expect(button).toHaveFocus();
    });

    test("no debe ser navegable por teclado cuando está deshabilitado", () => {
      render(<Button disabled>Click</Button>);

      const button = screen.getByRole("button");
      button.focus();

      expect(button).not.toHaveFocus();
    });
  });

  // ==========================================================================
  // SNAPSHOT TESTS (OPCIONAL)
  // ==========================================================================

  describe("Snapshots", () => {
    test("debe coincidir con snapshot en estado normal", () => {
      const { container } = render(<Button>Enviar</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    test("debe coincidir con snapshot en estado loading", () => {
      const { container } = render(<Button loading>Enviar</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    test("debe coincidir con snapshot en estado disabled", () => {
      const { container } = render(<Button disabled>Enviar</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
