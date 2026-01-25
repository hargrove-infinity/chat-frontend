import { useEffect, useState, type KeyboardEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { CHATS } from "../../constants/routes";
import { useStore } from "../../state/store";

export const useChatsMessages = () => {
  const { contactId } = useParams();
  const [socket, setSocket] = useState<Socket | null>(null);

  const chats = useStore((state) => state.chats);
  const messages = useStore((state) => state.messages);
  const getChats = useStore((state) => state.getChats);
  const getMessagesByChat = useStore((state) => state.getMessagesByChat);
  const logout = useStore((state) => state.logout);

  useEffect(() => {
    // TODO: Maybe remove it later
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

    const chatSocket = io(`${import.meta.env.VITE_BASE_URL}/chat`, {
      auth: { token },
    });

    setSocket(chatSocket);

    const onConnect = () => {
      console.log("Connected");
      chatSocket.emit(
        "chat message",
        `Socket ${chatSocket.id} has connected from the Frontend`,
      );
    };

    const onMessage = (msg: string) => {
      // TODO: Here message is being received from the backend and stored in zustand
      console.log(`message: ${msg}`);
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
    getChats();
  }, []);

  useEffect(() => {
    if (contactId) {
      getMessagesByChat(contactId);
    }
  }, [contactId]);

  const sendMessage = (content: string) => {
    if (!contactId || !content.trim()) return;

    if (socket) {
      // TODO: Here message is being sent to the backend
      socket.emit("chat message", { content, chatId: contactId });
    }
  };

  return {
    contactId,
    chats: chats || [],
    messages: messages || [],
    sendMessage,
    logout,
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
