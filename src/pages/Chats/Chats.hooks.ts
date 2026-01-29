import { useEffect, useState, type KeyboardEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { CHATS } from "../../constants/routes";
import {
  CHAT_EVENTS,
  CHAT_NAMESPACE,
  CONNECTION_EVENTS,
  WELCOME_EVENTS,
} from "../../constants/socket";
import { useStore } from "../../state/store";
import type { MessageServer } from "../../api/types";
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

    const onMessage = (msg: MessageServer) => {
      console.log("onMessage:", msg);
      useStore.setState((state) => ({
        messages: [
          ...(state.messages || []),
          { ...msg, isMine: getUser()?.id === msg.senderId },
        ],
      }));
    };

    const onJoinRoomMessage = (msg: string) => {
      console.log("onJoinRoomMessage:", msg);
    };

    const onGroupMessage = (msg: MessageServer) => {
      console.log("onGroupMessage:", msg);

      useStore.setState((state) => ({
        messages: [
          ...(state.messages || []),
          { ...msg, isMine: getUser()?.id === msg.senderId },
        ],
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
    chatSocket.on(CHAT_EVENTS.JOIN_ROOM_MESSAGE, onJoinRoomMessage);
    chatSocket.on(CHAT_EVENTS.MESSAGE_GROUP, onGroupMessage);
    chatSocket.on("connect_error", onConnectError);
    chatSocket.on("disconnect", onDisconnect);

    return () => {
      chatSocket.off("connect", onConnect);
      chatSocket.off(WELCOME_EVENTS.CHAT, onWelcomeMessage);
      chatSocket.off(CHAT_EVENTS.MESSAGE, onMessage);
      chatSocket.off(CHAT_EVENTS.JOIN_ROOM_MESSAGE, onJoinRoomMessage);
      chatSocket.off(CHAT_EVENTS.MESSAGE_GROUP, onGroupMessage);
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
    if (!socket || !chats?.length || !contactId || !content.trim()) return;

    const currentChat = chats.find((chat) => chat.id === contactId);

    if (!currentChat) return;

    if (currentChat.type === "direct") {
      socket.emit(CHAT_EVENTS.MESSAGE, { content, chatId: contactId });
    } else {
      socket.emit(CHAT_EVENTS.MESSAGE_GROUP, { content, chatId: contactId });
    }
  };

  return {
    socket,
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

const useChatsNavigation = (socket: Socket | null) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { contactId } = useParams();

  const prevContactId = location.state?.prevContactId;

  const chats = useStore((state) => state.chats);

  const onContactClick = (id: string): void => {
    navigate(`${CHATS}/${id}`, { state: { prevContactId: contactId } });
  };

  useEffect(() => {
    if (socket?.connected && contactId && chats?.length) {
      const foundGroupChat = chats.find(
        (chat) => chat.id === contactId && chat.type === "group",
      );

      if (foundGroupChat) {
        socket.emit(CHAT_EVENTS.JOIN_ROOM, contactId);
      }
    }
  }, [socket?.connected, contactId, chats]);

  useEffect(() => {
    if (socket?.connected && prevContactId && chats?.length) {
      const foundGroupChat = chats.find(
        (chat) => chat.id === prevContactId && chat.type === "group",
      );

      if (foundGroupChat) {
        socket.emit(CHAT_EVENTS.LEAVE_ROOM, prevContactId);
      }
    }
  }, [socket?.connected, prevContactId, chats]);

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
  const navigation = useChatsNavigation(chat.socket);
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
