import React, { type JSX } from "react";
import "./styles/main.scss"; // Archivo Sass principal
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import RegistrationForm from "./components/RegistrationForm";
import InsurancePage from "./components/InsurancePage";
import { UserProvider, useUserContext } from "./context/UserContext";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { formData } = useUserContext();

  // Verificar si el formulario está completo
  const isFormCompleted =
    formData.documentNumber && formData.cellphone && formData.privacyPolicy && formData.commercialPolicy;

  if (!isFormCompleted) {
    // Si no está completo, redirigir al formulario
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  return (
    <UserProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main>
            <Routes>
              {/* Ruta para el formulario */}
              <Route path="/" element={<RegistrationForm />} />

              {/* Ruta para InsurancePage protegida */}
              <Route
                path="/plans"
                element={
                  <ProtectedRoute>
                    <InsurancePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;
