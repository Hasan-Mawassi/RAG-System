import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, FileText, Settings } from "lucide-react";
import DocumentList from "../../components/DucumentList/index.jsx";
import FileUpload from "../../components/FileUpload/index.jsx";
import Message from "../../components/Message/index.jsx";
import ChatInput from "../../components/ChatInput/index.jsx";
import ErrorAlert from "../../components/ErrorAlert/index.jsx";
import LoadingMessage from "../../components/LoadingMessage/index.jsx";
import { useRag } from "../../hooks/rag/useRag.js";
import { useTheme } from "../../contexts/ThemeContext.js";
import { useSettings } from "../../contexts/SettingsContext.js";
import SettingsModal from "../../components/SettingModal/index.jsx";
import { ChatList } from "../../components/Chatlist/index.jsx";
import Sidebar from "../../components/Sidebar/index.jsx";

const ChatPage = () => {
  const {
    documents,
    messages,
    isUploading,
    isQuerying,
    error,
    uploadDocument,
    sendMessage,
    setError,
    chats,
    createNewChat,
    activeChatId,
    openChat,
    deleteDocument,
    deleteChat,
    chatDocumentCounts,
  } = useRag();
  //  uploadDocument,
  //     deleteDocument,
  //     sendMessage,
  //     setError,
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { settings, updateSettings } = useSettings();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // const [activeTab, setActiveTab] = useState("chats");
  useEffect(() => {
    if (localSettings.autoScroll) {
      scrollToBottom();
    }
  }, [messages, localSettings.autoScroll]);

  // Update local settings when settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSaveSettings = () => {
    updateSettings(localSettings);
    setShowSettings(false);
  };

  const handleCancelSettings = () => {
    setLocalSettings(settings);
    setShowSettings(false);
  };

  return (
    <div
      className={`flex h-screen ${
        isDarkMode ? "dark bg-dark-900" : "bg-white"
      }`}
    >
      {/* Sidebar */}
      <Sidebar
        isDarkMode={isDarkMode}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={createNewChat}
        onOpenChat={openChat}
        onDeleteChat={deleteChat}
        documents={documents}
        uploadDocument={uploadDocument}
        deleteDocument={deleteDocument}
        isUploading={isUploading}
        chatDocumentCounts={chatDocumentCounts}
      />

      {/* Sidebar toggle button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={`
          fixed md:absolute
          left-0 md:left-auto
          top-20 md:top-1/2
          md:-translate-y-1/2
          z-40 p-2
          border rounded-r-lg shadow-sm
          hover:bg-opacity-50 transition-all
          ${
            isDarkMode
              ? "bg-dark-700 border-dark-600 hover:bg-dark-600"
              : "bg-white border-gray-200 hover:bg-gray-50"
          }
        `}
        style={{ left: sidebarCollapsed ? "0" : "288px" }}
      >
        {sidebarCollapsed ? (
          <ChevronRight
            className={`w-4 h-4 ${
              isDarkMode ? "text-dark-300" : "text-gray-600"
            }`}
          />
        ) : (
          <ChevronLeft
            className={`w-4 h-4 ${
              isDarkMode ? "text-dark-300" : "text-gray-600"
            }`}
          />
        )}
      </button>

      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col ml-0 md:ml-0 md:pl-0 ${
          isDarkMode ? "bg-dark-900" : "bg-white"
        }`}
      >
        <div
          className={`flex items-center justify-around gap-3 border-b ${
            isDarkMode ? "border-dark-600" : "border-gray-200"
          }`}
        >
          <img src="/ragLogo.png" alt="RAG Logo" className="h-18 w-auto" />
          <div className="p-4 md:p-6">
            <h1
              className={`text-xl md:text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              RAG Assistant
            </h1>
            <p
              className={`text-xs md:text-sm mt-1 ${
                isDarkMode ? "text-dark-300" : "text-gray-500"
              }`}
            >
              Ask questions about your documents
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "text-dark-300 hover:text-white hover:bg-dark-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Settings className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />
          </button>
        </div>

        <div
          className={`flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 ${
            isDarkMode ? "bg-dark-900" : "bg-white"
          }`}
        >
          <ErrorAlert message={error} onClose={() => setError("")} />

          {messages.length === 0 && !isQuerying ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-xs md:max-w-md">
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    isDarkMode ? "bg-dark-700" : "bg-blue-100"
                  }`}
                >
                  <FileText
                    className={`w-8 h-8 ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </div>
                <h3
                  className={`text-lg md:text-xl font-semibold mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Get Started
                </h3>
                <p
                  className={`text-sm md:text-base ${
                    isDarkMode ? "text-dark-300" : "text-gray-500"
                  }`}
                >
                  Upload PDF documents and ask questions to get intelligent
                  answers.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {messages.map((msg, index) => (
                <Message
                  key={index}
                  message={msg}
                  isUser={msg.isUser}
                  showSources={localSettings.showSources}
                  isDark={isDarkMode}
                />
              ))}
              {isQuerying && <LoadingMessage />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className={`p-4 md:p-6 mb-6`}>
          <ChatInput onSend={sendMessage} isLoading={isQuerying} />
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        show={showSettings}
        isDarkMode={isDarkMode}
        localSettings={localSettings}
        setLocalSettings={setLocalSettings}
        handleCancelSettings={handleCancelSettings}
        handleSaveSettings={handleSaveSettings}
        toggleDarkMode={toggleDarkMode}
      />
    </div>
  );
};

export default ChatPage;
