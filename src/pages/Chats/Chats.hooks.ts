import { useEffect, useState, type KeyboardEvent } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import { CHATS } from "../../constants/routes";
import type { Message } from "./Chats.types";
import { messagesMap } from "./Chats.statics";

export const useChatsMessages = () => {
  const { contactId } = useParams();
  const [serverMessages, setServerMessages] = useState<string[]>([]);
  const [localMessages, setLocalMessages] = useState<{
    [key: string]: Message[];
  }>({ ...messagesMap });

  useEffect(() => {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

    const chatSocket = io(`${import.meta.env.VITE_BASE_URL}/chat`, {
      auth: { token },
    });

    const onConnect = () => {
      console.log("Connected");
      chatSocket.emit("chat message", "Hello from the Frontend");
    };

    const onMessage = (msg: string) => {
      console.log(`message: ${msg}`);
      setServerMessages((prev) => [...prev, msg]);
    };

    const onDisconnect = (reason: Socket.DisconnectReason): void => {
      console.log("Reason of disconnect:", reason);
    };

    const onConnectError = (error: Error) => {
      console.log("Error:", error);
    };

    chatSocket.on("connect", onConnect);
    chatSocket.on("chat message", onMessage);
    chatSocket.on("connect_error", onConnectError);
    chatSocket.on("disconnect", onDisconnect);

    return () => {
      chatSocket.off("connect", onConnect);
      chatSocket.off("chat message", onMessage);
      chatSocket.off("connect_error", onConnectError);
      chatSocket.off("disconnect", onDisconnect);
      chatSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (contactId) {
      setLocalMessages((prev) => ({
        ...prev,
        [contactId]: messagesMap[contactId] || [],
      }));
    }
  }, [contactId]);

  const sendMessage = (content: string) => {
    if (!contactId || !content.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      author: "You",
      content: content.trim(),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      isMine: true,
    };

    setLocalMessages((prev) => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMessage],
    }));
  };

  return {
    serverMessages,
    messages:
      contactId && Object.keys(localMessages).length
        ? localMessages[contactId]
        : [],
    sendMessage,
  };
};

export const useChatSendMessage = (sendMessage: (content: string) => void) => {
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return { inputValue, setInputValue, handleKeyDown, handleSend };
};

export const useChatsNavigation = () => {
  const navigate = useNavigate();

  const onContactClick = (id: string): void => {
    navigate(`${CHATS}/${id}`, { replace: false });
  };

  return { onContactClick };
};

export const useChats = () => {
  const messages = useChatsMessages();
  const navigation = useChatsNavigation();
  const sendMessage = useChatSendMessage(messages.sendMessage);

  return { messages, navigation, sendMessage };
};
