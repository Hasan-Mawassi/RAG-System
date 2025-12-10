
import { request } from "../../http/request.js";



export const ragService = {
  uploadDocument: async (file, chatId) => {
    const formData = new FormData();
    formData.append("file", file);
    if (chatId) formData.append("chatId", chatId);
    try {
      return await request({
        method: "POST",
        route: "/rag/upload",
        body: formData,
        auth: true,
      });
    } catch (error) {
      return {
        error: true,
        message: error.response?.data || "Upload failed",
      };
    }
  },

  deleteDocument: async (documentId) => {
    try {
      return await request({
        method: "DELETE",
        route: `/rag/document/${documentId}`,
        auth: true,
      });
    } catch (error) {
      return {
        error: true,
        message: error.response?.data || "Delete failed",
      };
    }
  },

  queryDocument: async ({
    question,
    topK = 5,
    modelProvider,
    modelName,
    chatId,
  }) => {
    return await request({
      method: "POST",
      route: "/rag/query",
      auth: true,
      body: {
        question,
        topK,
        modelProvider,
        modelName,
        chatId,
      },
    });
  },
  streamQuery: async ({ question, topK, modelProvider, modelName, chatId }) => {
    const params = new URLSearchParams({
      q: question,
      chatId,
      topK,
      modelProvider,
      modelName,
    });

    return `${import.meta.env.VITE_BASE_URL}/rag/stream?${params.toString()}`;
  },
  getChats: async () => {
    return await request({
      method: "GET",
      route: "/rag/chats",
      auth: true,
    });
  },
  getChatDocuments: async (chatId) => {
    return await request({
      method: "GET",
      route: `/rag/chats/${chatId}/documents`,
      auth: true,
    });
  },
  getMessages: async (chatId) => {
    return await request({
      method: "GET",
      route: `/rag/chats/${chatId}/messages`,
      auth: true,
    });
  },
  deleteChat: async (chatId) => {
    return await request({
      method: "DELETE",
      route: `/rag/chats/${chatId}`,
      auth: true,
    });
  },
  createChat: async () => {
    return await request({
      method: "POST",
      route: `/rag/chat`,
      auth: true,
    });
  },
};
