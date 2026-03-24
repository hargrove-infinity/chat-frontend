import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useShallow } from "zustand/shallow";
import { CHATS } from "../../constants/routes";
import {
  CHAT_EVENTS,
  CHAT_NAMESPACE,
  CONNECTION_EVENTS,
} from "../../constants/socket";
import {
  MessageStatusEnum,
  type LogInput,
  type MessageDTO,
} from "../../api/types";
import { METRICS_LOGS } from "../../api/endpoints";
import { useStore } from "../../state/store";
import type { ChatSocket } from "../../state/appSlice.types";
import { selectTypingParticipants } from "../../state/chatsSlice";
import { getToken } from "../../utils/token";
import { getUser } from "../../utils/getUser";
import { getTypingText } from "./Chats.helpers";

const TYPING_TIMEOUT = 2000;

const useChatLogs = () => {
  const logsRef = useRef<LogInput[]>([]);
  const chatSocket = useStore((state) => state.chatSocket);

  useEffect(() => {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        if (!logsRef.current.length) return;

        const logOnCloseTab = {
          message: null,
          name: null,
          socketId: chatSocket?.id ?? null,
          userId: getUser()?.id ?? null,
          event: "close_browser_tab",
          timestamp: new Date().toISOString(),
        };

        navigator.sendBeacon(
          `${import.meta.env.VITE_BASE_URL}${METRICS_LOGS}`,
          JSON.stringify([...logsRef.current, logOnCloseTab]),
        );
      }
    });
  }, []);

  return { logsRef };
};

const useChatSocket = (logsRef: RefObject<LogInput[]>) => {
  const setChatSocket = useStore((state) => state.setChatSocket);

  useEffect(() => {
    const chatSocket: ChatSocket = io(
      `${import.meta.env.VITE_BASE_URL}${CHAT_NAMESPACE}`,
      {
        auth: { token: getToken() },
        reconnectionAttempts: Infinity,
        reconnectionDelay: 5000,
        reconnectionDelayMax: 10000,
      },
    );

    setChatSocket(chatSocket);

    const onOnline = (onlineInterlocutorId: string): void => {
      useStore.setState((state) => {
        const updatedChats = state.chats?.map((chat) => {
          if (
            chat.type === "direct" &&
            chat.participants.find((p) => p.id === onlineInterlocutorId)
          ) {
            return { ...chat, isOnline: true };
          }

          return chat;
        });

        return { chats: updatedChats };
      });
    };

    const onOffline = (offlineInterlocutorId: string): void => {
      useStore.setState((state) => {
        const updatedChats = state.chats?.map((chat) => {
          if (
            chat.type === "direct" &&
            chat.participants.find((p) => p.id === offlineInterlocutorId)
          ) {
            return { ...chat, isOnline: false };
          }

          return chat;
        });

        return { chats: updatedChats };
      });
    };

    const onChatNewMessage = (msg: MessageDTO) => {
      useStore.setState((state) => {
        const updatedChats = state.chats?.map((chat) => {
          if (chat.id === msg.chatId) {
            return {
              ...chat,
              lastMessage: msg.content,
              unreadMessages: chat.unreadMessages + 1,
            };
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
              read: getUser()?.id === msg.senderId,
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
      logsRef.current.push({
        message: error.message,
        name: error.name,
        socketId: chatSocket.id ?? null,
        userId: getUser()?.id ?? null,
        event: "connect_error",
        timestamp: new Date().toISOString(),
      });
    };

    const onStartTypingBroadcast = ({
      chatId,
      userId,
    }: {
      chatId: string;
      userId: string;
    }): void => {
      useStore.setState((state) => {
        const updatedChats = state.chats?.map((chat) => {
          if (chat.id === chatId) {
            const updatedParticipants = chat.participants.map((participant) => {
              if (participant.id === userId) {
                return { ...participant, isTyping: true };
              }

              return participant;
            });

            return { ...chat, participants: updatedParticipants };
          }

          return chat;
        });

        return {
          chats: updatedChats,
        };
      });
    };

    const onStopTypingBroadcast = ({
      chatId,
      userId,
    }: {
      chatId: string;
      userId: string;
    }): void => {
      useStore.setState((state) => {
        const updatedChats = state.chats?.map((chat) => {
          if (chat.id === chatId) {
            const updatedParticipants = chat.participants.map((participant) => {
              if (participant.id === userId) {
                return { ...participant, isTyping: false };
              }

              return participant;
            });

            return { ...chat, participants: updatedParticipants };
          }

          return chat;
        });

        return {
          chats: updatedChats,
        };
      });
    };

    chatSocket.on(CONNECTION_EVENTS.ONLINE, onOnline);
    chatSocket.on(CONNECTION_EVENTS.OFFLINE, onOffline);
    chatSocket.on(CHAT_EVENTS.NEW_MESSAGE, onChatNewMessage);
    chatSocket.on(CHAT_EVENTS.START_TYPING_BROADCAST, onStartTypingBroadcast);
    chatSocket.on(CHAT_EVENTS.STOP_TYPING_BROADCAST, onStopTypingBroadcast);
    chatSocket.on("connect_error", onConnectError);
    chatSocket.on("disconnect", onDisconnect);

    return () => {
      chatSocket.off(CONNECTION_EVENTS.ONLINE, onOnline);
      chatSocket.off(CONNECTION_EVENTS.OFFLINE, onOffline);
      chatSocket.off(CHAT_EVENTS.NEW_MESSAGE, onChatNewMessage);
      chatSocket.off(
        CHAT_EVENTS.START_TYPING_BROADCAST,
        onStartTypingBroadcast,
      );
      chatSocket.off(CHAT_EVENTS.STOP_TYPING_BROADCAST, onStopTypingBroadcast);
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
  const allMessages = useStore((state) => state.messages);
  const getChats = useStore((state) => state.getChats);
  const getMessagesByChat = useStore((state) => state.getMessagesByChat);

  const messages = chatId
    ? allMessages?.filter((msg) => msg.chatId === chatId) || []
    : [];

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
      read: true,
      // No error yet - message is being sent
      error: null,
      // Timestamps are null until server responds with real values
      createdAt: null,
      updatedAt: null,
    };

    useStore.setState((state) => {
      const updatedChats = state.chats?.map((chat) => {
        if (chat.id === chatId) {
          return { ...chat, lastMessage: messageToSend.content };
        }

        return chat;
      });

      return {
        chats: updatedChats,
        messages: [...(state.messages || []), messageToSend],
      };
    });

    socket.emit(
      CHAT_EVENTS.SEND_MESSAGE,
      { content, chatId, tempId },
      (ack) => {
        if (ack.ok) {
          useStore.setState((state) => {
            const updMsgs = state.messages?.map((msg) => {
              if (msg.id === tempId && ack.message) {
                return {
                  ...ack.message,
                  isMine: true,
                  read: true,
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

  useEffect(() => {
    if (chatId) {
      socket?.volatile.emit(CHAT_EVENTS.STOP_TYPING_DISPATCH, chatId);
    }
  }, [chatId]);

  return {
    chatId,
    chats: chats || [],
    messages: messages || [],
    sendMessage,
  };
};

const useChatSendMessage = (sendMessage: (content: string) => void) => {
  const { chatId } = useParams();

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const socket = useStore((state) => state.chatSocket);

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

      if (chatId) {
        socket?.volatile.emit(CHAT_EVENTS.STOP_TYPING_DISPATCH, chatId);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      handleSend();
    } else {
      if (chatId) {
        socket?.volatile.emit(CHAT_EVENTS.START_TYPING_DISPATCH, chatId);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (chatId) {
          socket?.volatile.emit(CHAT_EVENTS.STOP_TYPING_DISPATCH, chatId);
        }

        typingTimeoutRef.current = null;
      }, TYPING_TIMEOUT);
    }
  };

  const emitStopTyping = (): void => {
    if (chatId) {
      socket?.volatile.emit(CHAT_EVENTS.STOP_TYPING_DISPATCH, chatId);
    }
  };

  return {
    inputValue,
    setInputValue,
    handleKeyDown,
    handleSend,
    emitStopTyping,
  };
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

const useChatsTypingText = () => {
  const { chatId } = useParams();

  const currentUserId = getUser()?.id;

  const typingParticipants = useStore(
    useShallow((state) =>
      selectTypingParticipants(state, chatId, currentUserId),
    ),
  );

  const typingText = getTypingText(typingParticipants);

  return { typingText };
};

export const useChats = () => {
  const { logsRef } = useChatLogs();
  useChatSocket(logsRef);
  const chat = useChatsMessages();
  const navigation = useChatsNavigation();
  const sendMessage = useChatSendMessage(chat.sendMessage);
  const profile = useChatUser();
  const auth = useChatLogout();
  const typing = useChatsTypingText();

  return {
    auth,
    chat,
    profile,
    navigation,
    sendMessage,
    typing,
  };
};
