import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Cpu } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { useSettings } from "../../contexts/SettingsContext.jsx";

const ChatInput = ({ onSend, isLoading }) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const { isDarkMode } = useTheme();
  const { settings } = useSettings(); // <-- GET modelProvider + modelName

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 130)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full px-2 sm:px-0">
      {/* Model Badge */}
      <div
        className={`
        mb-1 flex items-center gap-2 px-3 py-1 rounded-lg text-xs sm:text-sm font-medium w-fit
        ${
          isDarkMode
            ? "bg-gray-800 text-gray-200 border border-gray-700"
            : "bg-gray-100 text-gray-700 border border-gray-300"
        }
      `}
      >
        <Cpu className="w-4 h-4" />
        <span className="capitalize">{settings.modelProvider}</span>
        <span>-</span>
        <span className="font-semibold">{settings.modelName}</span>
      </div>

      {/* Chat Input */}
      <div
        className={`flex gap-2 border p-2 rounded-2xl shadow-sm transition-all duration-200 ${
          isFocused
            ? "border-blue-500 ring-2 ring-blue-100 shadow-md"
            : isDarkMode
            ? "border-gray-700 bg-gray-800"
            : "border-gray-300 bg-white"
        }`}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask a question about your documents..."
          disabled={isLoading}
          rows={1}
          className={`flex-1 px-3 py-3 text-sm sm:text-base border-none resize-none focus:outline-none max-h-32 overflow-y-auto ${
            isDarkMode
              ? "bg-gray-800 text-white placeholder-gray-400"
              : "bg-white text-gray-900"
          }`}
          style={{ minHeight: "48px" }}
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`shrink-0 p-3 rounded-full transition-colors self-end
            ${
              isDarkMode
                ? "bg-blue-700 hover:bg-blue-600 text-white"
                : "bg-blue-200 hover:bg-blue-300 text-blue-800"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isLoading ? (
            <Loader2
              className={`w-5 h-5 animate-spin${
                isDarkMode
                  ? "bg-blue-700 hover:bg-blue-600 text-white"
                  : "bg-blue-200 hover:bg-blue-300 text-blue-800"
              }`}
            />
          ) : (
            <Send
              className={`w-5 h-5${
                isDarkMode
                  ? "bg-blue-700 hover:bg-blue-600 text-white"
                  : "bg-blue-200 hover:bg-blue-300 text-blue-800"
              } `}
            />
          )}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;


