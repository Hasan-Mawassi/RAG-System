import { useState, useEffect, useRef } from "react";
import { ragService } from "../../services/rag/ragService";
import { useSettings } from "../../contexts/SettingsContext";


export const useRag = () => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const [error, setError] = useState("");

  const { settings } = useSettings();

  const messagesEndRef = useRef(null);

  /* Load all chats on first render */
  useEffect(() => {
    (async () => {
      const res = await ragService.getChats();
      if (!res.error) setChats(res);
    })();
  }, []);

  /* Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* --------------------------
   * CREATE NEW CHAT
   * -------------------------- */
  const createNewChat = async () => {
    const chat = await ragService.createChat();
    if (!chat.error) {
      setChats((prev) => [chat, ...prev]);
      setActiveChatId(chat.id);
      setDocuments([]);
      setMessages([]);
    }
  };

  /* --------------------------
   * SELECT CHAT
   * -------------------------- */
  const openChat = async (chatId) => {
    setActiveChatId(chatId);

    const [msgs, docs] = await Promise.all([
      ragService.getMessages(chatId),
      ragService.getChatDocuments(chatId),
    ]);

    if (!msgs.error) setMessages(msgs);

    if (!docs.error) {
      setDocuments(
        docs.map((d) => ({
          documentId: d.document.id,
          filename: d.document.filename,
          chunksProcessed: d.document.chunksProcessed ?? 0,
        }))
      );
    }
  };

  /* --------------------------
   * UPLOAD DOCUMENT
   * -------------------------- */
  const uploadDocument = async (file) => {
    setIsUploading(true);
    setError("");

    let chatId = activeChatId;

    // if NO chat selected → automatically create a new one
    if (!chatId) {
      const newChat = await ragService.createChat();
      chatId = newChat.id;

      setActiveChatId(chatId);
      setChats((prev) => [newChat, ...prev]);
    }

    const res = await ragService.uploadDocument(file, chatId);

    setIsUploading(false);

    if (res.error) return setError(res.message);

    setDocuments((prev) => [
      ...prev,
      {
        documentId: res.documentId,
        filename: file.name,
        chunksProcessed: res.chunksProcessed,
      },
    ]);
  };

  /* --------------------------
   * DELETE DOCUMENT
   * -------------------------- */
  const deleteDocument = async (docId) => {
    const res = await ragService.deleteDocument(docId);
    if (res.error) return setError(res.message);

    setDocuments((prev) => prev.filter((d) => d.documentId !== docId));
  };

  /* --------------------------
   * SEND MESSAGE
   * -------------------------- */
  const sendMessage = async (question) => {
    if (!activeChatId) {
      return setError("Please open a chat first.");
    }

    if (!question.trim()) return;

    // Push user message
    setMessages((prev) => [...prev, { isUser: true, content: question }]);
    setIsQuerying(true);

    // -------------------------------
    // 🔥 NORMAL MODE (No Streaming)
    // -------------------------------
    if (!settings.streamingEnabled) {
      try {
        const res = await ragService.queryDocument({
          question,
          topK: settings.topK,
          modelProvider: settings.modelProvider,
          modelName: settings.modelName,
          chatId: activeChatId,
        });
        //  If the backend updated the chat title
        if (res.updatedTitle) {
         animateChatTitle(res.updatedTitle, activeChatId, setChats);
       ;
        }
        setIsQuerying(false);

        if (res.error) {
          setError(res.message);
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            isUser: false,
            content: res.answer,
            sources: res.sources,
          },
        ]);

        return;
      } catch (err) {
        setError(err.message);
        setIsQuerying(false);
        return;
      }
    }

    // ----------------------------------------
    // 🔥 STREAMING MODE (ChatGPT-style)
    // ----------------------------------------

    // Insert the streaming message entry
    const index = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      { isUser: false, content: "", isStreaming: true },
    ]);

    try {
      const buildStreamUrl = (text, settings) => {
        const params = new URLSearchParams({
          chatId: activeChatId,
          q: text,
          topK: settings.topK.toString(),
          modelProvider: settings.modelProvider,
          modelName: settings.modelName,
        });

        return `http://192.168.1.11:5000/api/rag/stream?${params}`;
      };

      // SSE with Authorization
     const eventSource = new EventSource(buildStreamUrl(question, settings), {
       withCredentials: true,
     });

      let accumulated = "";

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // --- stream token ---
        if (data.type === "token") {
          accumulated += data.data;

          setMessages((prev) => {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              content: accumulated,
              isStreaming: true,
            };
            return updated;
          });
        }

        // --- stream done ---
        if (data.type === "done") {
          setMessages((prev) => {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              content: accumulated,
              isStreaming: false,
              sources: data.data.sources,
            };
            return updated;
          });

          setIsQuerying(false);
          eventSource.close();
        }

        if (data.data.updatedTitle) {
          animateChatTitle(data.data.updatedTitle, activeChatId, setChats);
          
        }
        // --- stream error ---
        if (data.type === "error") {
          setError(data.data);
          setIsQuerying(false);
          eventSource.close();
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE error:", err);
        setIsQuerying(false);
        eventSource.close();
      };
    } catch (err) {
      setError(err.message);
      setIsQuerying(false);
    }
  };

  /* --------------------------
   * DELETE CHAT
   * -------------------------- */
  const deleteChat = async (chatId) => {
    const res = await ragService.deleteChat(chatId);
    if (res.error) return setError(res.message);

    setChats((prev) => prev.filter((c) => c.id !== chatId));

    if (activeChatId === chatId) {
      setActiveChatId(null);
      setDocuments([]);
      setMessages([]);
    }
  };
const animateChatTitle = (fullTitle, activeChatId, setChats) => {
  let index = 0;

  // Start with an empty title
  setChats((prev) =>
    prev.map((c) =>
      c.id === activeChatId ? { ...c, title: "", animatingTitle: true } : c
    )
  );

  const interval = setInterval(() => {
    index++;
    const partial = fullTitle.substring(0, index);

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { ...c, title: partial, animatingTitle: true }
          : c
      )
    );

    if (index === fullTitle.length) {
      clearInterval(interval);

      // Remove animation flag
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId ? { ...c, animatingTitle: false } : c
        )
      );
    }
  }, 35); // typing speed (ms per letter)
};
  return {
    chats,
    activeChatId,
    openChat,
    createNewChat,

    documents,
    uploadDocument,
    deleteDocument,

    messages,
    sendMessage,
    deleteChat,

    isUploading,
    isQuerying,
    error,
    setError,

    messagesEndRef,
  };
};
