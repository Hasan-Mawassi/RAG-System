import React from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import ChatList from "../Chatlist";
import FileUpload from "../FileUpload";
import DocumentList from "../DucumentList";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = ({
  isDarkMode,
  sidebarCollapsed,
  setSidebarCollapsed,
  chats,
  activeChatId,
  onNewChat,
  onOpenChat,
  onDeleteChat,
  documents,
  uploadDocument,
  deleteDocument,
  isUploading,
}) => {
  const { logout } = useAuth();

  return (
    <>
      {/* SIDEBAR CONTAINER */}
      <div
        className={`
          ${sidebarCollapsed ? "hidden md:flex md:w-0" : "w-72 md:w-80"}
          flex flex-col
          fixed md:static inset-y-0 left-0 z-30
          border-r overflow-hidden
          transition-all duration-300
          ${
            isDarkMode
              ? "bg-dark-800 border-dark-600"
              : "bg-white border-gray-200"
          }
        `}
      >
        {/* ---------- HEADER ---------- */}
        <div
          className={`p-4 md:p-6 border-b ${
            isDarkMode ? "border-dark-600" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Chats
          </h2>
          <p
            className={`text-sm ${
              isDarkMode ? "text-dark-300" : "text-gray-500"
            }`}
          >
            Your conversations and documents
          </p>
        </div>

        {/* ---------- SCROLLABLE CONTENT ---------- */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* NEW CHAT BUTTON */}
          <button
            onClick={onNewChat}
            className="w-full py-2 bg-blue-600 text-white rounded-lg mb-4 hover:bg-blue-700 transition"
          >
            + New Chat
          </button>

          {/* CHAT LIST */}
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onOpenChat={onOpenChat}
            onDeleteChat={onDeleteChat}
          />

          {/* DOCUMENT SECTION */}
          {activeChatId ? (
            <div className="mt-6">
              <h3
                className={`text-sm font-semibold mb-2 ${
                  isDarkMode ? "text-dark-300" : "text-gray-700"
                }`}
              >
                Documents
              </h3>

              <FileUpload
                onUpload={(file) => uploadDocument(file, activeChatId)}
                isUploading={isUploading}
              />

              <div className="my-4 border-t border-gray-300"></div>

              <DocumentList
                documents={documents}
                onDelete={deleteDocument}
                isLoading={isUploading}
              />
            </div>
          ) : (
            <p
              className={`mt-6 text-xs italic ${
                isDarkMode ? "text-dark-300" : "text-gray-400"
              }`}
            >
              Select a chat to upload or manage documents.
            </p>
          )}
        </div>

        {/* ---------- FIXED LOGOUT BUTTON ---------- */}
        <div
          className={`p-4 border-t ${
            isDarkMode ? "border-dark-600" : "border-gray-200"
          }`}
        >
          <button
            onClick={logout}
            className={`
              flex items-center gap-3 w-full px-3 py-2 rounded-lg
              transition
              ${
                isDarkMode
                  ? "text-red-400 hover:bg-dark-700"
                  : "text-red-600 hover:bg-gray-100"
              }
            `}
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* SIDEBAR TOGGLE BUTTON */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={`
          fixed md:absolute left-0 md:left-auto
          top-20 md:top-1/2 md:-translate-y-1/2
          z-40 p-2 border rounded-r-lg shadow-sm
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
    </>
  );
};

export default Sidebar;
