import { useEffect, useState, type KeyboardEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { CHATS } from "../../constants/routes";
import {
  CHAT_EVENTS,
  CHAT_NAMESPACE,
  CONNECTION_EVENTS,
  WELCOME_EVENTS,
} from "../../constants/socket";
import { useStore } from "../../state/store";
import type { Message } from "../../api/types";
import { getToken } from "../../utils/token";
import { getUser } from "../../utils/getUser";

const useChatsMessages = () => {
  const { contactId } = useParams();
  const [socket, setSocket] = useState<Socket | null>(null);

  const chats = useStore((state) => state.chats);
  const messages = useStore((state) => state.messages);
  const getChats = useStore((state) => state.getChats);
  const getMessagesByChat = useStore((state) => state.getMessagesByChat);

  useEffect(() => {
    const chatSocket = io(`${import.meta.env.VITE_BASE_URL}${CHAT_NAMESPACE}`, {
      auth: { token: getToken() },
    });

    setSocket(chatSocket);

    // TODO: Find place where I can apply this
    // chatSocket.onAny((eventName, ...data) => {
    //   console.log("eventName", eventName);
    //   console.log("data", data);
    // });

    const onConnect = () => {
      console.log("Connected");
      chatSocket.emit(
        CONNECTION_EVENTS.CHAT,
        `Socket ${chatSocket.id} has connected from the Frontend (chats part)`,
      );
    };

    const onWelcomeMessage = (msg: string) => {
      console.log(`Welcome message: ${msg}`);
    };

    const onMessage = (msg: Message) => {
      console.log("onMessage:", msg);
      useStore.setState((state) => ({
        messages: [...(state.messages || []), msg],
      }));
    };

    const onDisconnect = (reason: Socket.DisconnectReason): void => {
      console.log("Reason of disconnect:", reason);
    };

    const onConnectError = (error: Error) => {
      console.log("Error:", error);
    };

    chatSocket.on("connect", onConnect);
    chatSocket.on(WELCOME_EVENTS.CHAT, onWelcomeMessage);
    chatSocket.on(CHAT_EVENTS.MESSAGE, onMessage);
    chatSocket.on("connect_error", onConnectError);
    chatSocket.on("disconnect", onDisconnect);

    return () => {
      chatSocket.off("connect", onConnect);
      chatSocket.off(WELCOME_EVENTS.CHAT, onWelcomeMessage);
      chatSocket.off(CHAT_EVENTS.MESSAGE, onMessage);
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
      socket.emit(CHAT_EVENTS.MESSAGE, { content, chatId: contactId });
    }
  };

  return {
    contactId,
    chats: chats || [],
    messages: messages || [],
    sendMessage,
  };
};

const useChatSendMessage = (sendMessage: (content: string) => void) => {
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

const useChatsNavigation = () => {
  const navigate = useNavigate();

  const onContactClick = (id: string): void => {
    navigate(`${CHATS}/${id}`, { replace: false });
  };

  return { onContactClick };
};

const useChatUser = () => {
  const user = getUser();

  const getUserInitials = () => {
    if (!user) return "?";
    const first = user.firstName.charAt(0).toUpperCase();
    const last = user.lastName.charAt(0).toUpperCase();
    return `${first}${last}`;
  };

  return { user, userInitials: getUserInitials() };
};

const useChatLogout = () => {
  const logout = useStore((state) => state.logout);

  return { logout };
};

export const useChats = () => {
  const chat = useChatsMessages();
  const navigation = useChatsNavigation();
  const sendMessage = useChatSendMessage(chat.sendMessage);
  const profile = useChatUser();
  const auth = useChatLogout();

  return {
    auth,
    chat,
    profile,
    navigation,
    sendMessage,
  };
};
