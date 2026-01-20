import React from "react";
import { MessageSquare, Trash2, FileText } from "lucide-react";

export const ChatList = ({
  chats,
  activeChatId,
  onOpenChat,
  onDeleteChat,
  chatDocuments,
  isDark,
}) => {
  return (
    <div className="space-y-2">
      {chats.length === 0 ? (
        <div
          className={`
        text-center text-sm py-4
        ${isDark ? "text-gray-400" : "text-gray-400"}
      `}
        >
          No chats yet
        </div>
      ) : (
        chats.map((chat) => {
          // Use documentCount from database if available, otherwise fall back to local state
          const docCount = chat.documentCount ?? chatDocuments?.[chat.id]?.length ?? 0;

          return (
            <div key={chat.id}>
              <div
                onClick={() => onOpenChat(chat.id)}
                className={`
              p-3 rounded-lg cursor-pointer flex justify-between items-center
              ${
                activeChatId === chat.id
                  ? isDark
                    ? "bg-blue-900/40"
                    : "bg-blue-100"
                  : isDark
                    ? "hover:bg-gray-800"
                    : "hover:bg-gray-100"
              }
            `}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare
                    size={16}
                    className={isDark ? "text-blue-400" : "text-blue-600"}
                  />
                  <span
                    className={`
                  font-medium text-sm
                  ${chat.animatingTitle ? "typing-cursor" : ""}
                  ${isDark ? "text-gray-200" : ""}
                `}
                  >
                    {chat.title}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`
                  flex items-center gap-1 text-xs
                  ${isDark ? "text-gray-300" : "text-gray-600"}
                `}
                  >
                    <FileText className="text-blue-600" size={14} />
                    {docCount}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className={`
                  hover:text-red-600
                  ${isDark ? "text-gray-400" : "text-gray-500"}
                `}
                  >
                    <Trash2 className="text-red-600" size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
export default ChatList;