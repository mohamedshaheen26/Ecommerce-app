import React, { createContext, useContext } from "react";
import { useTranslation } from "react-i18next";

type LanguageContextType = {
  currentLang: string;
  changeLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { i18n } = useTranslation();

  const value: LanguageContextType = {
    currentLang: i18n.language,
    changeLanguage: (lang: string) => i18n.changeLanguage(lang),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
