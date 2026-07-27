import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
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
  type MessageLocal,
} from "../../api/types";
import { METRICS_LOGS } from "../../api/endpoints";
import { useStore } from "../../state/store";
import type {
  ChatSocket,
  ReadReceiptPayload,
} from "../../state/appSlice.types";
import {
  selectChatsErrors,
  selectChatsView,
  selectCreateChat,
  selectIsChatCreated,
  selectIsCurrentChatGroup,
  selectTypingParticipants,
} from "../../state/chatsSlice";
import { getToken } from "../../utils/token";
import { getUser } from "../../utils/getUser";
import { getTypingText } from "./Chats.helpers";

const TYPING_TIMEOUT = 2000;
const MARK_AS_READ_TIMEOUT = 1500;

const useChatLogs = () => {
  const logsRef = useRef<LogInput[]>([]);
  const chatSocket = useStore((state) => state.chatSocket);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      if (!logsRef.current.length) return;

      const logOnCloseTab: LogInput = {
        message: null,
        name: null,
        socketId: chatSocket?.id ?? null,
        userId: getUser()?.id ?? null,
        event: "close_browser_tab",
        namespace: CHAT_NAMESPACE,
        source: "frontend",
        timestamp: new Date(),
      };

      navigator.sendBeacon(
        `${import.meta.env.VITE_BASE_URL}${METRICS_LOGS}`,
        JSON.stringify({
          logs: [...logsRef.current, logOnCloseTab],
          token: getToken(),
        }),
      );

      logsRef.current = [];
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return { logsRef };
};

const useChatSocket = (logsRef: RefObject<LogInput[]>) => {
  const { chatId } = useParams();
  const chatIdRef = useRef(chatId);

  const setChatSocket = useStore((state) => state.setChatSocket);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

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
            chat.type === "DIRECT" &&
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
            chat.type === "DIRECT" &&
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

        const newMessage = {
          ...msg,
          isMine: getUser()?.id === msg.userId,
          read: getUser()?.id === msg.userId,
          // Messages from server are already sent successfully, no error
          error: null,
        };

        return {
          chats: updatedChats,
          messages:
            // Only append the new message to the store if the user is currently
            // viewing this chat and messages have finished loading. Otherwise we'd
            // either mix messages from different chats into state.messages, or
            // insert the new message before the initial fetch completes — causing
            // duplicates once getMessagesByChat resolves.
            chatIdRef.current === msg.chatId && !state.loadingGetMessagesByChat
              ? [...(state.messages || []), newMessage]
              : state.messages,
        };
      });
    };

    const onNotifyAuthorMessageWasRead = (payload: ReadReceiptPayload) => {
      const { readerId, messageIds } = payload;

      useStore.setState((state) => {
        const updatedMessages = state.messages?.map((message) => {
          if (messageIds.includes(message.id)) {
            const updatedMessageReads = message.reads.map((msgRead) => {
              if (msgRead.userId === readerId) {
                return {
                  ...msgRead,
                  read: true,
                };
              }

              return msgRead;
            });

            const isReadMessage = updatedMessageReads.every(
              (readEvent) => readEvent.read,
            );

            return {
              ...message,
              reads: updatedMessageReads,
              status: isReadMessage ? MessageStatusEnum.READ : message.status,
            };
          }

          return message;
        });

        return {
          messages: updatedMessages,
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
        namespace: CHAT_NAMESPACE,
        source: "frontend",
        timestamp: new Date(),
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
    chatSocket.on(
      CHAT_EVENTS.NOTIFY_AUTHOR_MESSAGE_WAS_READ,
      onNotifyAuthorMessageWasRead,
    );
    chatSocket.on(CHAT_EVENTS.START_TYPING_BROADCAST, onStartTypingBroadcast);
    chatSocket.on(CHAT_EVENTS.STOP_TYPING_BROADCAST, onStopTypingBroadcast);
    chatSocket.on("connect_error", onConnectError);
    chatSocket.on("disconnect", onDisconnect);

    return () => {
      chatSocket.off(CONNECTION_EVENTS.ONLINE, onOnline);
      chatSocket.off(CONNECTION_EVENTS.OFFLINE, onOffline);
      chatSocket.off(CHAT_EVENTS.NEW_MESSAGE, onChatNewMessage);
      chatSocket.off(
        CHAT_EVENTS.NOTIFY_AUTHOR_MESSAGE_WAS_READ,
        onNotifyAuthorMessageWasRead,
      );
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
  const chats = useStore(useShallow(selectChatsView));

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
      userId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      content,
      status: MessageStatusEnum.SENDING,
      isMine: true,
      reads: [],
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

  const onContactClick = (id: string) => () => {
    navigate(`${CHATS}/${id}`);
  };

  return { onContactClick };
};

const useChatUserProfile = () => {
  const user = getUser();

  const logout = useStore((state) => state.logout);

  return { user, logout };
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

const useChatMessageObserver = (messages: MessageLocal[]) => {
  const userId = getUser()?.id;

  const socket = useStore((state) => state.chatSocket);

  const messageNodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const messageIdsToMarkAsRead = useRef<Set<string>>(new Set());
  const markAsReadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const setMessageNodeRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) {
        messageNodeRefs.current.set(id, el);
      } else {
        messageNodeRefs.current.delete(id);
      }
    },
    [],
  );

  const handleIntersections = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const messageId = (entry.target as HTMLDivElement).dataset.messageId;
        if (!messageId) return;

        if (entry.isIntersecting) {
          messageIdsToMarkAsRead.current.add(messageId);
        } else {
          messageIdsToMarkAsRead.current.delete(messageId);
        }
      });
    },
    [],
  );

  const handleMarkAsRead = useCallback(() => {
    if (!userId) return;

    if (!messageIdsToMarkAsRead.current.size) return;

    const messageIds = [...messageIdsToMarkAsRead.current];
    messageIdsToMarkAsRead.current.clear();

    const messageIdsSet = new Set(messageIds);

    useStore.setState((state) => {
      if (!state.messages?.length) return state;

      const hasUnreadToUpdate = state.messages.some(
        (msg) =>
          messageIdsSet.has(msg.id) &&
          msg.reads.some(
            (msgRead) => msgRead.userId === userId && !msgRead.read,
          ),
      );

      if (!hasUnreadToUpdate) return state;

      const updatedMessages = state.messages.map((msg) => {
        if (
          messageIdsSet.has(msg.id) &&
          msg.reads.some(
            (msgRead) => msgRead.userId === userId && !msgRead.read,
          )
        ) {
          return {
            ...msg,
            reads: msg.reads.map((msgRead) =>
              msgRead.userId === userId ? { ...msgRead, read: true } : msgRead,
            ),
          };
        }
        return msg;
      });

      const messageToMarkAsRead = state.messages.filter((msg) =>
        messageIdsSet.has(msg.id),
      );

      const chatUnreadMessagesCounterMap = messageToMarkAsRead.reduce(
        (acc: Record<string, number>, itm) => {
          acc[itm.chatId] = (acc[itm.chatId] || 0) + 1;
          return acc;
        },
        {},
      );

      const updatedChats = state.chats?.map((chat) => ({
        ...chat,
        unreadMessages: Math.max(
          chat.unreadMessages - (chatUnreadMessagesCounterMap[chat.id] ?? 0),
          0,
        ),
      }));

      return {
        messages: updatedMessages,
        chats: updatedChats || [],
      };
    });

    socket?.emit(CHAT_EVENTS.MESSAGE_WAS_READ, {
      readerId: userId,
      messageIds,
    });
  }, [socket, userId]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleIntersections, {
      threshold: 1,
    });

    markAsReadIntervalRef.current = setInterval(
      handleMarkAsRead,
      MARK_AS_READ_TIMEOUT,
    );

    return () => {
      observerRef.current?.disconnect();

      if (markAsReadIntervalRef.current) {
        clearInterval(markAsReadIntervalRef.current);
      }
    };
  }, [handleIntersections, socket]);

  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;

    messageNodeRefs.current.forEach((el) => observer.observe(el));

    return () => {
      messageNodeRefs.current.forEach((el) => observer.unobserve(el));
    };
  }, [messages]);

  return { setMessageNodeRef };
};

const useGroupChatReadReceiptMenu = () => {
  const [openReadMenuMessageId, setOpenReadMenuMessageId] = useState<
    string | null
  >(null);

  const { chatId } = useParams();

  const isGroupChat = useStore(
    useShallow((state) => selectIsCurrentChatGroup(state, chatId)),
  );

  const toggleReadMenu =
    (messageId: string) =>
    (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();
      setOpenReadMenuMessageId((prev) =>
        prev === messageId ? null : messageId,
      );
    };

  // Close menu when clicking anywhere outside (standard popover behavior)
  useEffect(() => {
    if (!openReadMenuMessageId) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const isClickOnReadButton = target.closest(
        `[data-read-button="${openReadMenuMessageId}"]`,
      );

      if (isClickOnReadButton) {
        return;
      }

      setOpenReadMenuMessageId(null);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openReadMenuMessageId]);

  return {
    isGroupChat,
    openReadMenuMessageId,
    toggleReadMenu,
  };
};

const useChatsModalUserSearch = () => {
  const createChat = useStore(selectCreateChat);
  const isChatCreated = useStore(selectIsChatCreated);
  const errors = useStore(selectChatsErrors);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupChatName, setGroupChatNameRaw] = useState("");
  const [groupNameError, setGroupNameError] = useState(false);

  const resetSelection = () => {
    setSelectedUserIds([]);
    setGroupChatNameRaw("");
    setGroupNameError(false);
  };

  const openUserSearchModal = () => setIsSearchOpen(true);

  const closeUserSearchModal = () => {
    setIsSearchOpen(false);
    resetSelection();
  };

  const setGroupChatName = (value: string) => {
    setGroupChatNameRaw(value);
    if (groupNameError) setGroupNameError(false);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];

      // Fewer than 2 users selected means the name input is no longer
      // shown/required, so any stale error for it should disappear too.
      if (next.length < 2 && groupNameError) {
        setGroupNameError(false);
      }

      return next;
    });
  };

  const selectedCount = selectedUserIds.length;
  const isCreateChatDisabled = selectedCount === 0;
  const showGroupNameInput = selectedCount >= 2;

  const getButtonText = (selectedUsersNumber: number) => {
    switch (selectedUsersNumber) {
      case 0:
        return "Create chat";
      case 1:
        return "Create single chat";
      default:
        return "Create group chat";
    }
  };

  const createChatButtonText = getButtonText(selectedCount);

  const handleCreateChat = () => {
    if (isCreateChatDisabled) return;

    // Group chat name is mandatory once 2+ users are selected - block
    // creation and surface the error instead of closing the modal.
    if (showGroupNameInput && !groupChatName.trim()) {
      setGroupNameError(true);
      return;
    }

    // Wiring this up to the actual "create chat" API/socket call is left
    // for the backend integration step - this already has everything
    // (selectedUserIds, and groupChatName when relevant) needed for it.
    const data = {
      userIds: selectedUserIds,
      name: showGroupNameInput ? groupChatName.trim() : null,
    };

    if (createChatButtonText === "Create group chat" && data.name) {
      createChat({
        name: data.name,
        type: "GROUP",
        participantIds: data.userIds,
      });
    } else {
      createChat({ type: "DIRECT", participantIds: data.userIds });
    }
  };

  useEffect(() => {
    closeUserSearchModal();
    useStore.setState({ isChatCreated: false });
  }, [isChatCreated]);

  return {
    isSearchOpen,
    selectedUserIds,
    groupChatName,
    groupNameError,
    selectedCount,
    isCreateChatDisabled,
    showGroupNameInput,
    createChatButtonText,
    errors,
    openUserSearchModal,
    closeUserSearchModal,
    toggleUserSelection,
    setGroupChatName,
    handleCreateChat,
  };
};

export const useChats = () => {
  const { logsRef } = useChatLogs();
  useChatSocket(logsRef);
  const chat = useChatsMessages();
  const navigation = useChatsNavigation();
  const sendMessage = useChatSendMessage(chat.sendMessage);
  const profile = useChatUserProfile();
  const typing = useChatsTypingText();
  const observer = useChatMessageObserver(chat.messages);
  const readReceiptMenu = useGroupChatReadReceiptMenu();
  const modalUserSearch = useChatsModalUserSearch();

  return {
    chat,
    profile,
    navigation,
    sendMessage,
    typing,
    observer,
    readReceiptMenu,
    modalUserSearch,
  };
};
