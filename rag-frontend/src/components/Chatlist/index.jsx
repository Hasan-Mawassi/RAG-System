// import { useState } from "react";
// import {
//   MessageSquare,
//   Trash2,
//   ChevronDown,
//   ChevronRight,
//   FileText,
// } from "lucide-react";

// export const ChatList = ({
//   chats,
//   chatDocuments,
//   activeChatId,
//   onSelectChat,
//   onDeleteChat,
//   onOpenChat,
// }) => {
//   const [openChat, setOpenChat] = useState(null); // which chat section is expanded

//   const toggleChat = (chatId) => {
//     setOpenChat((prev) => (prev === chatId ? null : chatId));

//     // Load messages when the chat first opens
//     if (openChat !== chatId) {
//       onOpenChat(chatId);
//     }
//   };

//   return (
//     <div className="space-y-2">
//       {chats.length === 0 ? (
//         <div className="text-center py-4 text-gray-400 text-sm">
//           No chats yet
//         </div>
//       ) : (
//         chats.map((chat) => (
//           <div
//             key={chat.id}
//             className={`border rounded-lg overflow-hidden ${
//               activeChatId === chat.id ? "border-blue-400" : "border-gray-200"
//             }`}
//           >
//             {/* Chat Header */}
//             <div
//               className={`
//                 flex items-center justify-between p-3 cursor-pointer 
//                 hover:bg-gray-100 transition
//                 ${activeChatId === chat.id ? "bg-blue-50" : "bg-white"}
//               `}
//               onClick={() => {
//                 onSelectChat(chat.id);
//                 toggleChat(chat.id);
//               }}
//             >
//               <div className="flex items-center gap-2">
//                 {openChat === chat.id ? (
//                   <ChevronDown size={16} />
//                 ) : (
//                   <ChevronRight size={16} />
//                 )}

//                 <MessageSquare className="text-blue-600" size={16} />
//                 <p className="font-medium text-sm">{chat.title}</p>
//               </div>

//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onDeleteChat(chat.id);
//                 }}
//                 className="p-1 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded"
//               >
//                 <Trash2 size={14} />
//               </button>
//             </div>

//             {/* Dropdown Documents */}
//             {openChat === chat.id && (
//               <div className="bg-gray-50 px-4 py-2 space-y-2">
//                 {chatDocuments[chat.id]?.length > 0 ? (
//                   chatDocuments[chat.id].map((doc) => (
//                     <div
//                       key={doc.documentId}
//                       className="flex items-center gap-2 p-2 bg-white rounded border hover:bg-gray-100 cursor-default"
//                     >
//                       <FileText className="text-green-600" size={15} />
//                       <div className="text-sm">
//                         <p className="font-medium text-gray-700">
//                           {doc.filename}
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           {doc.chunksProcessed} chunks
//                         </p>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-xs text-gray-500 pl-6 py-1">
//                     No documents uploaded to this chat.
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// };
// src/components/ChatList/index.jsx
// import { useState } from "react";
// import {
//   MessageSquare,
//   Trash2,
//   ChevronDown,
//   ChevronRight,
//   FileText,
// } from "lucide-react";

// export const ChatList = ({
//   chats,
//   activeChatId,
//   chatDocuments,
//   onOpenChat,
//   onDeleteChat,
// }) => {
//   const [expanded, setExpanded] = useState(new Set());

//   const toggleExpand = (id) => {
//     const newSet = new Set(expanded);
//     newSet.has(id) ? newSet.delete(id) : newSet.add(id);
//     setExpanded(newSet);
//   };

//   if (!chats.length)
//     return (
//       <div className="text-gray-400 text-center py-4">No chats yet</div>
//     );

//   return (
//     <div className="space-y-2">
//       {chats.map((chat) => {
//         const isActive = activeChatId === chat.id;
//         const isExpanded = expanded.has(chat.id);
//         const docs = chatDocuments[chat.id] || [];

//         return (
//           <div
//             key={chat.id}
//             className={`border rounded-lg ${
//               isActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
//             }`}
//           >
//             {/* Chat header */}
//             <div
//               className="p-3 flex justify-between cursor-pointer"
//               onClick={() => {
//                 onOpenChat(chat.id);
//                 toggleExpand(chat.id);
//               }}
//             >
//               <div className="flex items-center gap-2">
//                 {isExpanded ? (
//                   <ChevronDown size={16} />
//                 ) : (
//                   <ChevronRight size={16} />
//                 )}
//                 <MessageSquare size={16} />
//                 <span className="font-medium">{chat.title}</span>
//               </div>

//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onDeleteChat(chat.id);
//                 }}
//               >
//                 <Trash2
//                   size={16}
//                   className="text-gray-500 hover:text-red-600"
//                 />
//               </button>
//             </div>

//             {/* Documents dropdown */}
//             {isExpanded && (
//               <div className="bg-gray-100 p-2 space-y-1">
//                 <p className="text-xs text-gray-500 font-semibold px-1">
//                   Documents ({docs.length})
//                 </p>

//                 {docs.length === 0 && (
//                   <p className="text-xs text-gray-400 px-1">No documents</p>
//                 )}

//                 {docs.map((doc) => (
//                   <div
//                     key={doc.documentId}
//                     className="flex gap-2 items-center text-sm px-2 py-1"
//                   >
//                     <FileText size={14} className="text-blue-600" />
//                     <span>{doc.filename}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };
// import React from "react";
// import { Trash2 } from "lucide-react";
// export const ChatList = ({ chats, activeChatId, onOpenChat, onDeleteChat }) => {
//   return (
//     <div className="space-y-1">
//       {chats.map((chat) => (
//         <div key={chat.id}>
//           <div
//             className={`p-3 flex justify-between items-center rounded cursor-pointer
//               ${activeChatId === chat.id ? "bg-blue-100" : "hover:bg-gray-100"}
//             `}
//             onClick={() => onOpenChat(chat.id)}
//           >
//             <span>{chat.title}</span>

//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onDeleteChat(chat.id);
//               }}
//             >
//               <Trash2 size={16} />
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };
import React from "react";
import { MessageSquare, Trash2, FileText } from "lucide-react";

export const ChatList = ({
  chats,
  activeChatId,
  onOpenChat,
  onDeleteChat,
  chatDocuments,
}) => {
  return (
    <div className="space-y-2">
      {chats.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-4">
          No chats yet
        </div>
      ) : (
        chats.map((chat) => {
          const docs = chatDocuments?.[chat.id] || [];

          return (
            <div key={chat.id}>
              <div
                onClick={() => onOpenChat(chat.id)}
                className={`
                  p-3 rounded-lg cursor-pointer flex justify-between items-center
                  ${
                    activeChatId === chat.id
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-600" />
                  <span
                    className={`font-medium text-sm ${
                      chat.animatingTitle ? "typing-cursor" : ""
                    }`}
                  >
                    {chat.title}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-gray-600 text-xs">
                    <FileText size={14} />
                    {docs.length}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <Trash2 size={14} />
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