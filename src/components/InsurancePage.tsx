import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import { FaArrowLeft } from "react-icons/fa";
import {
  fetchPlans,
  filterPlansByAge,
  applyDiscountToPlans,
  type Plan,
} from "../services/plansApi";
import "../styles/insurancepage.scss";
import { scroller } from "react-scroll";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type UserOption = "personal" | "someone";

// ============================================================================
// CONSTANTS
// ============================================================================

const DISCOUNT_RATE = 0.95;
const SCROLL_GAP = 16;
const CARD_ANIMATION_DELAY = 200;

const PLAN_IMAGES: Record<string, string> = {
  "Plan en Casa": "/assets/icons/ico-plans-1.png",
  "Plan en Casa y Clínica": "/assets/icons/ico-plans-2.png",
  "Plan en Casa + Bienestar": "/assets/icons/ico-plans-1.png",
  "Plan en Casa + Chequeo": "/assets/icons/ico-plans-1.png",
  "Plan en Casa + Fitness": "/assets/icons/ico-plans-1.png",
  default: "/assets/icons/ico-plans-1.png",
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const getPlanImage = (planName: string): string => {
  return PLAN_IMAGES[planName] || PLAN_IMAGES.default;
};

const formatPrice = (price: number): string => {
  return price.toFixed(2);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const InsurancePage: React.FC = () => {
  const { userData, formData } = useUserContext();
  const navigate = useNavigate();

  // State Management
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedOption, setSelectedOption] = useState<UserOption | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [errorPlans, setErrorPlans] = useState<string | null>(null);

  // Slider Controls
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  // Derived Values
  const userAge = userData?.birthDay ? calculateAge(userData.birthDay) : 0;
  const userName = userData?.name || "Usuario";

  // ============================================================================
  // API CALLS
  // ============================================================================

  const loadPlans = useCallback(async () => {
    setLoadingPlans(true);
    setErrorPlans(null);

    try {
      const allPlans = await fetchPlans();
      const eligiblePlans = filterPlansByAge(allPlans, userAge);
      setPlans(eligiblePlans);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error desconocido al cargar planes";
      setErrorPlans(errorMessage);
      console.error("Error loading plans:", error);
    } finally {
      setLoadingPlans(false);
    }
  }, [userAge]);

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

  const updateArrows = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const maxScroll = slider.scrollWidth - slider.clientWidth - 1;
    setCanPrev(slider.scrollLeft > 1);
    setCanNext(slider.scrollLeft < maxScroll);
  }, []);

  const scrollByOneCard = useCallback((direction: "prev" | "next") => {
    const slider = sliderRef.current;
    if (!slider) return;

    const firstCard = slider.querySelector<HTMLElement>(".plan-card");
    const scrollDistance = firstCard
      ? firstCard.offsetWidth + SCROLL_GAP
      : Math.round(slider.clientWidth * 0.9);

    const scrollAmount =
      direction === "next" ? scrollDistance : -scrollDistance;

    slider.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Fetch plans on mount
  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Filter plans based on selected option
  useEffect(() => {
    if (!selectedOption || plans.length === 0) {
      setFilteredPlans([]);
      return;
    }

    const updatedPlans =
      selectedOption === "someone"
        ? applyDiscountToPlans(plans, DISCOUNT_RATE)
        : plans;

    setFilteredPlans(updatedPlans);
  }, [selectedOption, plans]);

  // Setup slider scroll listener
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.addEventListener("scroll", updateArrows, { passive: true });
    updateArrows();

    return () => {
      slider.removeEventListener("scroll", updateArrows);
    };
  }, [filteredPlans, updateArrows]);

  // ============================================================================ 
  // SCROLL TO TOP AFTER FORM SUBMISSION
  // ============================================================================

  useEffect(() => {
    if (currentStep === 2 || currentStep === 1) {
      // Scroll to top after form submission
      scroller.scrollTo("insurance-page-top", {
        smooth: true,
        offset: -100, // Optional offset
        delay: 200
      });
    }
  }, [currentStep]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderProgressBar = () => (
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

      <nav className="progress" aria-label="Progreso de cotización">
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
    </div>
  );

  const renderBackButton = () => (
    <div className="back-button-row no-mobile">
      <button className="back-button" onClick={handleBack} aria-label="Volver">
        <div className="back-circle">
          <FaArrowLeft size={12} />
        </div>
        <span className="back-text">Volver</span>
      </button>
    </div>
  );

  const renderStepOneHeader = () => (
    <div className="centered-box-row">
      <div className="centered-box">
        <h1>{userName}, ¿Para quién deseas cotizar?</h1>
        <p>Selecciona la opción que mejor se ajuste a tus necesidades.</p>
      </div>
    </div>
  );

  const renderUserOptions = () => (
    <section className="options-row" aria-label="Opciones de cotización">
      <div
        className={`option-box ${
          selectedOption === "personal" ? "selected" : ""
        }`}
        onClick={() => handleOptionSelect("personal")}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === "Enter" && handleOptionSelect("personal")}
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
        className={`option-box ${
          selectedOption === "someone" ? "selected" : ""
        }`}
        onClick={() => handleOptionSelect("someone")}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === "Enter" && handleOptionSelect("someone")}
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
            Realiza una cotización para uno de tus familiares o cualquier
            persona.
          </p>
        </div>
      </div>
    </section>
  );

  const renderPlanCard = (plan: Plan, index: number) => {
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
              <li key={`${index}-desc-${i}`}>{item}</li>
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
  };

  const renderPlansList = () => (
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
            <button
              className="slider-btn slider-btn--prev"
              onClick={() => scrollByOneCard("prev")}
              disabled={!canPrev}
              aria-label="Ver planes anteriores"
            >
              ‹
            </button>

            <div ref={sliderRef} className="plans-list__grid slider">
              {filteredPlans.map((plan, idx) => renderPlanCard(plan, idx))}
            </div>

            <button
              className="slider-btn slider-btn--next"
              onClick={() => scrollByOneCard("next")}
              disabled={!canNext}
              aria-label="Ver más planes"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  );

  const renderSummary = () => {
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
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <main className="insurance-page" id="insurance-page-top">
      {renderProgressBar()}
      {renderBackButton()}

      {currentStep === 1 && (
        <>
          {renderStepOneHeader()}
          {renderUserOptions()}
          {selectedOption && renderPlansList()}
        </>
      )}

      {currentStep === 2 && renderSummary()}
    </main>
  );
};

export default InsurancePage;
