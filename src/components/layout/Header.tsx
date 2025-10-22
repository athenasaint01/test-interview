import React from "react";
import { FaPhoneAlt } from "react-icons/fa";
import "../../styles/header.scss"; // Archivo para los estilos del Header

const Header = () => {
  return (
    <header className="header">
      <div className="header__content">
        <div className="header__logo">
          <img loading="lazy" src="/assets//icons/logo.svg" alt="Rimac Logo" />
        </div>
        <div className="header__contact">
          <p>¡Compra por este medio!</p>
          <a href="tel:+0114116001">
            <FaPhoneAlt className="phone-icon" />
            &nbsp; (01) 411 6001
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
