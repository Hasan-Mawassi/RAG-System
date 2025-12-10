import React from "react";
import { useSettings } from "../../contexts/SettingsContext.jsx";
import { useTheme } from "../../contexts/ThemeContext.jsx";

const MODEL_OPTIONS = {
  ollama: ["qwen2:1.5b"],
  groq: ["llama-3.1-8b-instant", "llama-3.1-70b-versatile", "mixtral-8x7b"],
};

export default function ModelSelector() {
  const { settings, updateSettings } = useSettings();
  const { isDarkMode } = useTheme();

  const handleProviderChange = (e) => {
    const provider = e.target.value;
    updateSettings({
      modelProvider: provider,
      modelName: MODEL_OPTIONS[provider][0], // default model
    });
  };

  const handleModelChange = (e) => {
    updateSettings({
      modelName: e.target.value,
    });
  };

  return (
    <div
      className={`
        flex flex-col gap-3 p-4 rounded-xl border 
        transition-colors duration-200
        ${
          isDarkMode
            ? "bg-white-800 border-gray-700 text-gray-100"
            : "bg-gray-100 border-gray-300 text-gray-800"
        }
      `}
    >
      {/* Model Provider */}
      <label className="text-sm font-medium opacity-90">Model Provider</label>
      <select
        value={settings.modelProvider}
        onChange={handleProviderChange}
        className={`
          p-2 rounded-lg outline-none focus:ring-2 transition
          ${
            isDarkMode
              ? "bg-white-700 border-gray-600 text-gray-100 focus:ring-purple-400"
              : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
          }
          border
        `}
      >
        <option value="ollama">Ollama (Local)</option>
        <option value="groq">Groq (Cloud)</option>
      </select>

      {/* Model Name */}
      <label className="text-sm font-medium opacity-90">Model Name</label>
      <select
        value={settings.modelName}
        onChange={handleModelChange}
        className={`
          p-2 rounded-lg outline-none focus:ring-2 transition
          ${
            isDarkMode
              ? "bg-white-700 border-gray-600 text-gray-100 focus:ring-purple-400"
              : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
          }
          border
        `}
      >
        {MODEL_OPTIONS[settings.modelProvider]?.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
