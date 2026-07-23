import { useState, useEffect, useRef, useCallback } from "react";
import { MessageType } from "./types";

const SESSION_STORAGE_KEY = "spp_chatbot_conversation_session";

export function useChat(websiteId: string, apiKey: string, welcomeMessage: string) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(false);

  // 1. Session Storage Initialization
  useEffect(() => {
    isMountedRef.current = true;
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load chatbot history from sessionStorage:", e);
    }

    // Default Welcome Message if no stored session exists
    if (welcomeMessage && welcomeMessage.trim() !== "") {
      setMessages([
        {
          role: "assistant",
          content: welcomeMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [welcomeMessage]);

  // 2. Persist Messages on Changes
  useEffect(() => {
    if (!isMountedRef.current || messages.length === 0) return;
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save chatbot history to sessionStorage:", e);
    }
  }, [messages]);

  // 3. Cleanup on Unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 4. Abort Current Request Stream
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setIsLoading(false);
      
      // Update message history to indicate stream termination
      setMessages((prev) => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].role === "assistant") {
          updated[updated.length - 1].content += "\n\n*(Generation stopped by user)*";
        }
        return updated;
      });
    }
  }, []);

  // 5. Send Message Operation
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setError(null);
    setIsLoading(true);
    setIsStreaming(false);

    // Cancel any current active controller before starting a new run
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: MessageType = {
      role: "user",
      content: text,
      timestamp,
    };

    setMessages((prev) => [...prev, userMsg]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "Authorization": `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          website_id: websiteId,
          message: text,
        }),
        signal: controller.signal,
      });

      // Handle server-side errors (401, 403, 500, etc.)
      if (!response.ok) {
        let errorMsg = `Server error (status ${response.status})`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.error || errorMsg;
        } catch {
          // Response is not JSON
        }
        throw new Error(errorMsg);
      }

      const contentType = response.headers.get("content-type") || "";

      // 6. Check if response is a Server-Sent Event stream
      if (contentType.includes("text/event-stream") || response.body) {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Unable to obtain stream body reader.");
        }

        setIsLoading(false);
        setIsStreaming(true);

        const assistantMsg: MessageType = {
          role: "assistant",
          content: "",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        const decoder = new TextDecoder();
        let currentText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          currentText += chunkText;

          // Update typing progress state
          setMessages((prev) => {
            const updated = [...prev];
            if (updated.length > 0) {
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: currentText,
              };
            }
            return updated;
          });
        }
      } else {
        // 7. Fallback to standard JSON parsing if streaming is omitted
        const data = await response.json();
        const content = data.content || data.message || JSON.stringify(data);
        setIsLoading(false);
        
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.info("Chat stream was aborted by client.");
        return;
      }

      console.error("Chat completion error:", err);
      setIsLoading(false);
      setIsStreaming(false);

      // Gracefully push error notification inside chatbot session
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Sorry, I encountered an error while processing your request: *${err.message || "Connection failed"}*. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [websiteId, apiKey]);

  // 8. Clear Session state
  const clearChat = useCallback(() => {
    stopGeneration();
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear sessionStorage:", e);
    }
    if (welcomeMessage && welcomeMessage.trim() !== "") {
      setMessages([
        {
          role: "assistant",
          content: welcomeMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [stopGeneration, welcomeMessage]);

  return {
    messages,
    sendMessage,
    clearChat,
    stopGeneration,
    isLoading,
    isStreaming,
    error,
  };
}
export type UseChatReturn = ReturnType<typeof useChat>;
