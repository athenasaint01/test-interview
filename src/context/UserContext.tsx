import React, { createContext, useContext, useState } from "react";

// Tipos para los datos de usuario y del formulario
interface UserData {
  name: string;
  lastName: string;
  birthDay: string;
}

interface FormData {
  documentType: string;
  documentNumber: string;
  cellphone: string;
  privacyPolicy: boolean;
  commercialPolicy: boolean;
}

// Tipo del contexto
interface UserContextType {
  userData: UserData;
  formData: FormData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

// Creación del contexto
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider del contexto
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<UserData>({
    name: "",
    lastName: "",
    birthDay: "",
  });

  const [formData, setFormData] = useState<FormData>({
    documentType: "DNI",
    documentNumber: "",
    cellphone: "",
    privacyPolicy: false,
    commercialPolicy: false,
  });

  return (
    <UserContext.Provider
      value={{ userData, setUserData, formData, setFormData }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Hook para usar el contexto
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
