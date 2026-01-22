import { useState, useEffect } from "react";
import { SettingsContext } from "./SettingsContext";

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      apiBaseUrl: "http://localhost/api/",
      timeout: 30,
      autoScroll: true,
      showSources: true,
      topK: 5,
      compactMode: false,
      modelProvider: "ollama",
      modelName: "qwen2:1.5b",
    };
  });

  useEffect(() => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      apiBaseUrl: "http://13.37.226.34:5000/api/v1",
      timeout: 30,
      autoScroll: true,
      showSources: true,
      topK: 5,
      compactMode: false,
      modelProvider: "ollama",
      modelName: "qwen2:1.5b",
    };
    setSettings(defaultSettings);
  };

  const value = {
    settings,
    updateSettings,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
