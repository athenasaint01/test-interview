import React from "react";
import "../../styles/footer.scss"; // Archivo para los estilos del Footer

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__logo">
          <img loading="lazy" src="/assets/icons/logo-white.svg" alt="Rimac Logo" />
        </div>
        {/* Esta línea solo aparecerá en dispositivos móviles */}
        <hr />
        <p className="footer__text">&#169; 2023 RIMAC Seguros y Reaseguro.</p>
      </div>
    </footer>
  );
};

export default Footer;
