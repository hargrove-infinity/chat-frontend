import { useEffect, useState, type KeyboardEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { CHATS } from "../../constants/routes";
import {
  CHAT_EVENTS,
  CHAT_NAMESPACE,
  CONNECTION_EVENTS,
  WELCOME_EVENTS,
} from "../../constants/socket";
import { MessageStatusEnum, type MessageServer } from "../../api/types";
import { useStore } from "../../state/store";
import { getToken } from "../../utils/token";
import { getUser } from "../../utils/getUser";
import type { SendMessageAck } from "./Chats.types";

const useChatSocket = () => {
  const setChatSocket = useStore((state) => state.setChatSocket);

  useEffect(() => {
    const chatSocket = io(`${import.meta.env.VITE_BASE_URL}${CHAT_NAMESPACE}`, {
      auth: { token: getToken() },
    });

    setChatSocket(chatSocket);

    // TODO: Find place where I can apply this
    // chatSocket.onAny((eventName, ...data) => {
    //   console.log("eventName", eventName);
    //   console.log("data", data);
    // });

    const onConnect = () => {
      console.log("Connected");
    };

    const onOnline = (onlineInterlocutorId: string): void => {
      console.log("onlineInterlocutorId", onlineInterlocutorId);

      useStore.setState((state) => {
        const updatedChats = state.chats?.map((chat) => {
          if (
            chat.type === "direct" &&
            chat.participants.includes(onlineInterlocutorId)
          ) {
            return { ...chat, isOnline: true };
          }

          return chat;
        });

        return { chats: updatedChats };
      });
    };

    const onOffline = (offlineInterlocutorId: string): void => {
      console.log("offlineInterlocutorId", offlineInterlocutorId);

      useStore.setState((state) => {
        const updatedChats = state.chats?.map((chat) => {
          if (
            chat.type === "direct" &&
            chat.participants.includes(offlineInterlocutorId)
          ) {
            return { ...chat, isOnline: false };
          }

          return chat;
        });

        return { chats: updatedChats };
      });
    };

    const onWelcomeMessage = (msg: string) => {
      console.log(`Welcome message: ${msg}`);
    };

    const onChatNewMessage = (msg: MessageServer | null) => {
      console.log("onMessage:", msg);

      if (!msg) return;

      useStore.setState((state) => {
        const updatedChats = state.chats?.map((chat) => {
          if (chat.id === msg.chatId) {
            return { ...chat, lastMessage: msg.content };
          }

          return chat;
        });

        return {
          chats: updatedChats,
          messages: [
            ...(state.messages || []),
            {
              ...msg,
              isMine: getUser()?.id === msg.senderId,
              // Messages from server are already sent successfully, no error
              error: null,
            },
          ],
        };
      });
    };

    const onDisconnect = (reason: Socket.DisconnectReason): void => {
      console.log("Reason of disconnect:", reason);
    };

    const onConnectError = (error: Error) => {
      console.log("Error:", error);
    };

    chatSocket.on("connect", onConnect);
    chatSocket.on(WELCOME_EVENTS.CHAT, onWelcomeMessage);
    chatSocket.on(CONNECTION_EVENTS.ONLINE, onOnline);
    chatSocket.on(CONNECTION_EVENTS.OFFLINE, onOffline);
    chatSocket.on(CHAT_EVENTS.NEW_MESSAGE, onChatNewMessage);
    chatSocket.on("connect_error", onConnectError);
    chatSocket.on("disconnect", onDisconnect);

    return () => {
      chatSocket.off("connect", onConnect);
      chatSocket.off(WELCOME_EVENTS.CHAT, onWelcomeMessage);
      chatSocket.off(CONNECTION_EVENTS.ONLINE, onOnline);
      chatSocket.off(CONNECTION_EVENTS.OFFLINE, onOffline);
      chatSocket.off(CHAT_EVENTS.NEW_MESSAGE, onChatNewMessage);
      chatSocket.off("connect_error", onConnectError);
      chatSocket.off("disconnect", onDisconnect);
      chatSocket.disconnect();
    };
  }, []);
};

const useChatsMessages = () => {
  const { chatId } = useParams();
  const user = getUser();
  const socket = useStore((state) => state.chatSocket);
  const chats = useStore((state) => state.chats);
  const messages = useStore((state) => state.messages);
  const getChats = useStore((state) => state.getChats);
  const getMessagesByChat = useStore((state) => state.getMessagesByChat);

  useEffect(() => {
    getChats();
  }, []);

  useEffect(() => {
    if (chatId) {
      getMessagesByChat(chatId);
    }
  }, [chatId]);

  const sendMessage = (content: string) => {
    if (!socket || !chats?.length || !chatId || !content.trim() || !user) {
      return;
    }

    const currentChat = chats.find((chat) => chat.id === chatId);

    if (!currentChat) return;

    const tempId = uuidv4();

    // Optimistic message before server confirmation
    const messageToSend = {
      id: tempId,
      chatId,
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      content,
      status: MessageStatusEnum.SENDING,
      isMine: true,
      // No error yet - message is being sent
      error: null,
      // Timestamps are null until server responds with real values
      createdAt: null,
      updatedAt: null,
    };

    useStore.setState((state) => {
      return {
        messages: [...(state.messages || []), messageToSend],
      };
    });

    socket.emit(
      CHAT_EVENTS.SEND_MESSAGE,
      { content, chatId, tempId },
      (ack: SendMessageAck) => {
        if (ack.ok) {
          useStore.setState((state) => {
            const updMsgs = state.messages?.map((msg) => {
              if (msg.id === tempId && ack.message) {
                return {
                  ...ack.message,
                  isMine: true,
                  // Server confirmed success, clear any potential error
                  error: null,
                };
              }

              return msg;
            });

            return { messages: [...(updMsgs || [])] };
          });
        } else {
          useStore.setState((state) => {
            const updMsgs = state.messages?.map((msg) => {
              if (msg.id === tempId) {
                return {
                  ...msg,
                  error: ack.error,
                  status: MessageStatusEnum.ERROR,
                };
              }

              return msg;
            });

            return { messages: [...(updMsgs || [])] };
          });
        }
      },
    );
  };

  return {
    chatId,
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
    navigate(`${CHATS}/${id}`);
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
  useChatSocket();
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
