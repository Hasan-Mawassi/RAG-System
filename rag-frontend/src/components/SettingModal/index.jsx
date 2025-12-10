import React from "react";
import ModelSelector from "../ModelSelector";

const SettingsModal = ({
  show,
  isDarkMode,
  localSettings,
  setLocalSettings,
  handleCancelSettings,
  handleSaveSettings,
  toggleDarkMode,
}) => {
  if (!show) return null; // Do NOT render anything if modal is closed

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto ${
          isDarkMode
            ? "bg-dark-800 text-white border border-white"
            : "bg-white text-gray-900 "
        }`}
      >
        <div
          className={`flex justify-between items-center p-6 border-b ${
            isDarkMode ? "border-dark-600" : "border-gray-200"
          }`}
        >
          <h3 className="text-lg font-semibold">Settings</h3>
          <button
            onClick={handleCancelSettings}
            className={`text-2xl ${
              isDarkMode
                ? "text-dark-300 hover:text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* API Settings */}
          {/* <div>
            <h4
              className={`text-sm font-medium mb-3 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              API Configuration
            </h4>
            <div className="space-y-3">
              <div>
                <label
                  className={`block text-xs font-medium mb-1 ${
                    isDarkMode ? "text-dark-300" : "text-gray-700"
                  }`}
                >
                  Base URL
                </label>
                <input
                  type="text"
                  value={localSettings.apiBaseUrl}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      apiBaseUrl: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    isDarkMode
                      ? "bg-dark-700 border-dark-600 text-white"
                      : "border-gray-300 text-gray-900"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-medium mb-1 ${
                    isDarkMode ? "text-dark-300" : "text-gray-700"
                  }`}
                >
                  Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={localSettings.timeout}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      timeout: parseInt(e.target.value),
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    isDarkMode
                      ? "bg-dark-700 border-dark-600 text-white"
                      : "border-gray-300 text-gray-900"
                  }`}
                />
              </div>
            </div>
          </div> */}

          {/* Chat Settings */}
          <div>
            <h4
              className={`text-sm font-medium mb-3 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Chat Settings
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    isDarkMode ? "text-dark-300" : "text-gray-700"
                  }`}
                >
                  Auto-scroll to bottom
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.autoScroll}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        autoScroll: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    isDarkMode ? "text-dark-300" : "text-gray-700"
                  }`}
                >
                  Show source documents
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showSources}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        showSources: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label
                  className={`block text-xs font-medium mb-1 ${
                    isDarkMode ? "text-dark-300" : "text-gray-700"
                  }`}
                >
                  Max results (topK)
                </label>
                <select
                  value={localSettings.topK}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      topK: parseInt(e.target.value),
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    isDarkMode
                      ? "bg-dark-700 border-dark-600 text-white"
                      : "border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="3">3</option>
                  <option value="5">5</option>
                  <option value="8">8</option>
                  <option value="10">10</option>
                </select>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div>
            <h4
              className={`text-sm font-medium mb-3 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Display Settings
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    isDarkMode ? "text-dark-300" : "text-gray-700"
                  }`}
                >
                  Dark mode
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {/* <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={localSettings.streamingEnabled}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      streamingEnabled: e.target.checked,
                    })
                  }
                />
                <span>Enable Streaming Response</span>
              </label> */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    isDarkMode ? "text-dark-300" : "text-gray-700"
                  }`}
                >
                  Enable Streaming Response
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.streamingEnabled}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        streamingEnabled: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />

                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
          <ModelSelector />
          {/* Data Management */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Data Management
            </h4>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors text-sm font-medium">
                Clear All Documents
              </button>
              <button className="w-full px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium">
                Clear Chat History
              </button>
              <button className="w-full px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium">
                Export Chat History
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t border-dark-600">
            <button
              onClick={handleCancelSettings}
              className={`flex-1 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                isDarkMode
                  ? "bg-dark-700 text-white hover:bg-dark-600 border"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
