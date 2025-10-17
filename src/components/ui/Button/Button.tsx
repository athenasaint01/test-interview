import React from "react";
import "./Button.scss";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

// ============================================================================
// COMPONENT - Mantiene estructura HTML original
// ============================================================================

export const Button: React.FC<ButtonProps> = ({
  loading = false,
  loadingText = "Cargando...",
  disabled = false,
  children,
  className = "",
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      className={className}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <div className="loading-container">
          <span className="loader" aria-hidden="true"></span>
          <span className="loading-text">{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
