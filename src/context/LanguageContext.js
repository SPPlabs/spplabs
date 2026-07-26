"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext({
  lang: "es",
  changeLanguage: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("es");

  useEffect(() => {
    const savedLang = localStorage.getItem("spp_lang");
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("spp_lang", newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
