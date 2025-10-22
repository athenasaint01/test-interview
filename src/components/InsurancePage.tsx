import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import { FaArrowLeft } from "react-icons/fa";
import { applyDiscountToPlans, type Plan } from "../services/plansApi";
import "../styles/insurancepage.scss";
import { scroller } from "react-scroll";

// Imports from separated files
import type { UserOption } from "../types/InsurancePage";
import {
  DISCOUNT_RATE,
  CARD_ANIMATION_DELAY,
  SCROLL_OFFSET,
  SCROLL_DELAY,
  HIGHLIGHT_PHRASES,
} from "../constants/InsurancePage";
import {
  calculateAge,
  getPlanImage,
  formatPrice,
  escapeRegExp,
  normalizePlanName,
} from "../helpers/InsurancePage";
import { usePlansData, useSliderControls } from "../hooks/InsurancePage";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InsurancePage() {
  const { userData, formData } = useUserContext();
  const navigate = useNavigate();

  // State Management
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedOption, setSelectedOption] = useState<UserOption | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Derived Values - useMemo for performance
  const userAge = useMemo(
    () => (userData?.birthDay ? calculateAge(userData.birthDay) : 0),
    [userData?.birthDay]
  );

  const userName = useMemo(
    () => userData?.name || "Usuario",
    [userData?.name]
  );

  // Custom Hooks
  const { plans, loadingPlans, errorPlans } = usePlansData(userAge);

  // Filter plans based on selected option
  const filteredPlans = useMemo(() => {
    if (!selectedOption || plans.length === 0) {
      return [];
    }

    return selectedOption === "someone"
      ? applyDiscountToPlans(plans, DISCOUNT_RATE)
      : plans;
  }, [selectedOption, plans]);

  const sliderControls = useSliderControls(filteredPlans.length);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleBack = useCallback(() => {
    if (currentStep === 1) {
      navigate("/");
    } else {
      setCurrentStep(1);
      setSelectedPlan(null);
    }
  }, [currentStep, navigate]);

  const handleOptionSelect = useCallback((option: UserOption) => {
    setSelectedOption(option);
  }, []);

  const handleSelectPlan = useCallback((plan: Plan) => {
    setSelectedPlan(plan);
    setCurrentStep(2);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Scroll to top after step change
  useEffect(() => {
    if (currentStep === 2 || currentStep === 1) {
      scroller.scrollTo("insurance-page-top", {
        smooth: true,
        offset: SCROLL_OFFSET,
        delay: SCROLL_DELAY,
      });
    }
  }, [currentStep]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderProgressBar = useCallback(() => (
    <div className="progress-container">
      <button
        className="back-button2 no-desktop"
        onClick={handleBack}
        aria-label="Volver"
      >
        <div className="back-circle">
          <FaArrowLeft size={12} />
        </div>
      </button>

      <nav className="progress no-mobile" aria-label="Progreso de cotización">
        <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
          <div className={`circle ${currentStep >= 1 ? "active" : ""}`}>1</div>
          <span className="step-title no-mobile">Planes y coberturas</span>
        </div>
        <div className={`dots ${currentStep >= 1 ? "active" : ""}`} />
        <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
          <div className={`circle ${currentStep >= 2 ? "active" : ""}`}>2</div>
          <span className="step-title no-mobile">Resumen</span>
        </div>
      </nav>

      <div className="progress-bar-mobile ">
        <label htmlFor="pasos" className="progress-text no-desktop">PASO 1 DE 2</label>
        <progress id="pasos" className="no-desktop" value="5" max="100"></progress>
      </div>
    </div>
  ), [currentStep, handleBack]);

  const renderBackButton = useCallback(() => (
    <div className="back-button-row no-mobile">
      <button className="back-button" onClick={handleBack} aria-label="Volver">
        <div className="back-circle">
          <FaArrowLeft size={12} />
        </div>
        <span className="back-text">Volver</span>
      </button>
    </div>
  ), [handleBack]);

  const renderStepOneHeader = useCallback(() => (
    <div className="centered-box-row">
      <div className="centered-box">
        <h1>{userName}, ¿Para quién deseas cotizar?</h1>
        <p>Selecciona la opción que mejor se ajuste a tus necesidades.</p>
      </div>
    </div>
  ), [userName]);

  const renderUserOptions = useCallback(() => (
    <section className="options-row" aria-label="Opciones de cotización">
      <div
        className={`option-box ${selectedOption === "personal" ? "selected" : ""}`}
        onClick={() => handleOptionSelect("personal")}
        role="button"
        tabIndex={0}
      >
        <input
          type="radio"
          id="personal"
          name="user-option"
          className="input-checkbox"
          checked={selectedOption === "personal"}
          onChange={() => handleOptionSelect("personal")}
          aria-label="Para mí"
        />
        <div className="icon">
          <img loading="lazy" src="/assets/icons/para-mi-logo.png" alt="" />
          <h2 className="no-desktop">Para mí</h2>
        </div>
        <div className="option-text">
          <h2 className="no-mobile">Para mí</h2>
          <p>Cotiza tu seguro de salud y agrega familiares si lo deseas.</p>
        </div>
      </div>

      <div
        className={`option-box ${selectedOption === "someone" ? "selected" : ""}`}
        onClick={() => handleOptionSelect("someone")}
        role="button"
        tabIndex={0}
      >
        <input
          type="radio"
          id="someone"
          name="user-option"
          className="input-checkbox"
          checked={selectedOption === "someone"}
          onChange={() => handleOptionSelect("someone")}
          aria-label="Para alguien más"
        />
        <div className="icon">
          <img loading="lazy" src="/assets/icons/para-otros-logo.png" alt="" />
          <h2 className="no-desktop">Para alguien más</h2>
        </div>
        <div className="option-text">
          <h2 className="no-mobile">Para alguien más</h2>
          <p>
            Realiza una cotización para uno de tus familiares o cualquier persona.
          </p>
        </div>
      </div>
    </section>
  ), [selectedOption, handleOptionSelect]);

  /**
   * Applies highlights to specific phrases in plan descriptions
   */
  const applyHighlights = useCallback((planName: string, text: string): React.ReactNode => {
    const normalizedName = normalizePlanName(planName);
    const phrases = HIGHLIGHT_PHRASES[normalizedName] || [];
    if (phrases.length === 0) return text;

    const regex = new RegExp(
      `(${phrases.map((p) => escapeRegExp(p)).join("|")})`,
      "gi"
    );

    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;

    text.replace(regex, (match, _p1, offset) => {
      if (offset > lastIndex) nodes.push(text.slice(lastIndex, offset));
      nodes.push(<strong key={`${offset}-${match}`}>{match}</strong>);
      lastIndex = offset + match.length;
      return match;
    });

    if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
    return nodes;
  }, []);

  const renderPlanCard = useCallback((plan: Plan, index: number) => {
    const isRecommended = plan.name === "Plan en Casa y Clínica";
    const displayPrice = formatPrice(plan.price);
    const originalPrice =
      selectedOption === "someone"
        ? formatPrice(plan.price / DISCOUNT_RATE)
        : null;

    return (
      <article
        key={index}
        className="plan-card"
        style={{ animationDelay: `${index * CARD_ANIMATION_DELAY}ms` }}
      >
        <header className="plan-card__header">
          <div className="plan-card__name">
            {isRecommended && (
              <span className="plan-card__recommended-tag">
                Plan recomendado
              </span>
            )}
            <h3 className="plan-card__title">{plan.name}</h3>
          </div>
          <div className="plan-card__icon">
            <img loading="lazy" src={getPlanImage(plan.name)} alt="" />
          </div>
        </header>

        <div className="plan-card__price-info">
          <span className="plan-card__label">COSTO DEL PLAN</span>
          {originalPrice && (
            <p className="tachado" aria-label="Precio anterior">
              ${originalPrice}
            </p>
          )}
          <div className="plan-card__price">${displayPrice} al mes</div>
        </div>

        <hr />

        {plan.description && plan.description.length > 0 && (
          <ul className="plan-card__desc">
            {plan.description.map((item, i) => (
              <li key={`${index}-desc-${i}`}>
                {applyHighlights(plan.name, item)}
              </li>
            ))}
          </ul>
        )}

        <button
          className="plan-card__cta"
          onClick={() => handleSelectPlan(plan)}
        >
          Seleccionar plan
        </button>
      </article>
    );
  }, [selectedOption, handleSelectPlan, applyHighlights]);

  const renderPlansList = useCallback(() => (
    <section
      className="plans-list is-visible"
      aria-label="Lista de planes disponibles"
    >
      <div className="container">
        {loadingPlans && (
          <div className="plans-list__loading" role="status">
            Cargando planes…
          </div>
        )}

        {errorPlans && (
          <div className="plans-list__error" role="alert">
            {errorPlans}
          </div>
        )}

        {!loadingPlans && !errorPlans && filteredPlans.length === 0 && (
          <div className="plans-list__empty">
            No hay planes disponibles para tu edad.
          </div>
        )}

        {!loadingPlans && !errorPlans && filteredPlans.length > 0 && (
          <div className="plans-sliderWrap">
            {/* SLIDER */}
            <div ref={sliderControls.sliderRef} className="plans-list__grid slider">
              {filteredPlans.map((plan, idx) => renderPlanCard(plan, idx))}
            </div>

            {/* FOOTER de navegación (debajo del slider) */}
            <div className="slider-footer" aria-label="Navegación de planes">
              <button
                className="slider-btn slider-btn--prev"
                onClick={() => sliderControls.scrollByOneCard("prev")}
                disabled={!sliderControls.canPrev}
                aria-label="Ver planes anteriores"
              >
                ‹
              </button>

              <span className="slider-counter" aria-live="polite">
                {sliderControls.currentSlide} / {sliderControls.totalSlides}
              </span>

              <button
                className="slider-btn slider-btn--next"
                onClick={() => sliderControls.scrollByOneCard("next")}
                disabled={!sliderControls.canNext}
                aria-label="Ver más planes"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  ), [loadingPlans, errorPlans, filteredPlans, sliderControls, renderPlanCard]);

  const renderSummary = useCallback(() => {
    if (!selectedPlan) return null;

    const finalPrice = formatPrice(selectedPlan.price);

    return (
      <section
        className="plan-summary"
        aria-label="Resumen del plan seleccionado"
      >
        <h2>Resumen del Seguro</h2>

        <div className="container">
          <small>Precios calculados para:</small>

          <div className="plan-summary__item">
            <span className="plan-summary__icon">
              <img loading="lazy" src="/assets/icons/ico-user.png" alt="" />
            </span>
            <p>
              <strong>
                {userData?.name} {userData?.lastName}
              </strong>
            </p>
          </div>

          <hr />

          <h3 className="subtitles">Responsable de pago</h3>
          <div className="plan-summary__item info">
            <p>DNI: {formData?.documentNumber}</p>
          </div>
          <div className="plan-summary__item info">
            <p>Celular: {formData?.cellphone}</p>
          </div>

          <h3 className="subtitles">Plan elegido</h3>
          <div className="plan-summary__item info">
            <p>{selectedPlan.name}</p>
          </div>
          <div className="plan-summary__item info">
            <p>Costo del Plan: ${finalPrice} al mes</p>
          </div>
        </div>
      </section>
    );
  }, [selectedPlan, userData, formData]);

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <main className="insurance-page" id="insurance-page-top">
      {currentStep === 1 && (
        <>
          {renderProgressBar()}
          {renderBackButton()}
          {renderStepOneHeader()}
          {renderUserOptions()}
          {selectedOption && renderPlansList()}
        </>
      )}

      {currentStep === 2 && (
        <>
          {/* Oculto en mobile */}
          <div className="no-mobile">{renderProgressBar()}</div>
          {renderBackButton()}
          {renderSummary()}
        </>
      )}
    </main>
  );
}
