import type { StateCreator } from "zustand";
import type { Chat, MessageLocal } from "../api/types";
import { getChatsRequest, getMessagesByChatRequest } from "../api/requests";
import { isApiError, isAxiosError } from "../api/utils";
import { getUser } from "../utils/getUser";

export const initialChatsState = {
  errors: null,
  loadingGetChats: false,
  loadingGetMessagesByChat: false,
  chats: null,
  messages: null,
};

export interface ChatsSlice {
  errors: null | string[];
  loadingGetChats: boolean;
  loadingGetMessagesByChat: boolean;
  chats: null | Chat[];
  messages: null | MessageLocal[];
  getChats: () => Promise<void>;
  getMessagesByChat: (chatId: string) => Promise<void>;
}

export const createChatsSlice: StateCreator<ChatsSlice> = (set) => ({
  ...initialChatsState,
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
        isMine: getUser()?.id === msg.senderId,
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
