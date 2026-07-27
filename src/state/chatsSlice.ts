import type { StateCreator } from "zustand";
import type { Chat, MessageLocal } from "../api/types";
import {
  createChatRequest,
  getChatsRequest,
  getMessagesByChatRequest,
} from "../api/requests";
import { isApiError, isAxiosError } from "../api/utils";
import { getUser } from "../utils/getUser";

export type CreateChatArgs = {
  type: "DIRECT" | "GROUP";
  participantIds: string[];
  name?: string | null;
};

export const initialChatsState = {
  errors: null,
  loadingCreateChat: false,
  loadingGetChats: false,
  loadingGetMessagesByChat: false,
  chats: null,
  messages: null,
  isChatCreated: false,
};

export interface ChatsSlice {
  errors: null | string[];
  loadingCreateChat: boolean;
  loadingGetChats: boolean;
  loadingGetMessagesByChat: boolean;
  chats: null | Chat[];
  messages: null | MessageLocal[];
  isChatCreated: boolean;
  createChat: (body: CreateChatArgs) => Promise<void>;
  getChats: () => Promise<void>;
  getMessagesByChat: (chatId: string) => Promise<void>;
}

export const createChatsSlice: StateCreator<ChatsSlice> = (set) => ({
  ...initialChatsState,
  createChat: async (body: CreateChatArgs) => {
    try {
      set({ loadingCreateChat: true });

      await createChatRequest(body);
      const res = await getChatsRequest();
      const { payload } = res.data;

      set({
        loadingCreateChat: false,
        chats: payload,
        isChatCreated: true,
        errors: null,
      });
    } catch (error) {
      set({ loadingCreateChat: false });

      if (isAxiosError(error)) {
        if (isApiError(error)) {
          set({ errors: error.response.data.errors });
          return;
        }
        set({ errors: ["Unknown axios error"] });
        return;
      }

      set({ errors: ["Unknown error"] });
    }
  },
  getChats: async () => {
    try {
      set({ loadingGetChats: true });
      const res = await getChatsRequest();
      const { payload } = res.data;
      set({ loadingGetChats: false, chats: payload });
    } catch (error) {
      set({ loadingGetChats: false });

      if (isAxiosError(error)) {
        if (isApiError(error)) {
          set({ errors: error.response.data.errors });
          return;
        }
        set({ errors: ["Unknown axios error"] });
        return;
      }

      set({ errors: ["Unknown error"] });
    }
  },
  getMessagesByChat: async (chatId: string) => {
    try {
      set({ loadingGetMessagesByChat: true });
      const res = await getMessagesByChatRequest(chatId);
      const { payload } = res.data;

      const messagesWithOwners = payload.map((msg) => ({
        ...msg,
        isMine: getUser()?.id === msg.userId,
        // Messages fetched from server have no errors (successfully retrieved)
        error: null,
      }));

      set({ loadingGetMessagesByChat: false, messages: messagesWithOwners });
    } catch (error) {
      set({ loadingGetMessagesByChat: false });

      if (isAxiosError(error)) {
        if (isApiError(error)) {
          set({ errors: error.response.data.errors });
          return;
        }
        set({ errors: ["Unknown axios error"] });
        return;
      }

      set({ errors: ["Unknown error"] });
    }
  },
});

export const selectCreateChat = (state: ChatsSlice) => {
  return state.createChat;
};

export const selectIsChatCreated = (state: ChatsSlice) => {
  return state.isChatCreated;
};

export const selectLoadingCreateChat = (state: ChatsSlice) => {
  return state.loadingCreateChat;
};

export const selectChatsErrors = (state: ChatsSlice) => {
  return state.errors;
};

const getChatInitials = (name: string | null): string => {
  if (!name) return "";

  return name
    .split(" ")
    .filter((word) => /^[a-zA-Z]/.test(word))
    .map((word) => word[0].toUpperCase())
    .slice(0, 2)
    .join("");
};

// Selector for typing participants
export const selectTypingParticipants = (
  state: ChatsSlice,
  chatId: string | undefined,
  currentUserId: string | undefined,
) => {
  if (!chatId || !currentUserId) return [];

  const activeChat = state.chats?.find((chat) => chat.id === chatId);

  return (
    activeChat?.participants.filter(
      (p) => p.isTyping && p.id !== currentUserId,
    ) ?? []
  );
};

/**
 * Selector that transforms chats into UI-ready view data.
 * - Adds `chatInitials` derived from chat name
 * - Normalizes `lastMessage` (fallback if null)
 */
export const selectChatsView = (() => {
  let lastChats: ChatsSlice["chats"] | undefined;
  let lastResult: (Chat & { chatInitials: string })[] = [];

  return (state: ChatsSlice) => {
    if (state.chats === lastChats) {
      return lastResult;
    }

    lastChats = state.chats;

    lastResult =
      state.chats?.map((chat) => ({
        ...chat,
        lastMessage: chat.lastMessage || "No message yet",
        chatInitials: getChatInitials(chat.name),
      })) || [];

    return lastResult;
  };
})();

/**
 * Returns the boolean whether is current chat type is group.
 * Returns null if no chat is selected.
 */
export const selectIsCurrentChatGroup = (
  state: ChatsSlice,
  chatId: string | undefined,
) => {
  if (!chatId) return null;
  return state.chats?.find((chat) => chat.id === chatId)?.type === "GROUP";
};
