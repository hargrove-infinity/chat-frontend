import type { StateCreator } from "zustand";
import type { Chat, Message } from "../api/types";
import { getChatsRequest, getMessagesByChatRequest } from "../api/requests";
import { isApiError, isAxiosError } from "../api/utils";

export interface ChatsSlice {
  errors: null | string[];
  loadingGetChats: boolean;
  loadingGetMessagesByChat: boolean;
  chats: null | Chat[];
  messages: null | Message[];
  getChats: () => Promise<void>;
  getMessagesByChat: (chatId: string) => Promise<void>;
}

export const createChatsSlice: StateCreator<ChatsSlice> = (set) => ({
  errors: null,
  loadingGetChats: false,
  loadingGetMessagesByChat: false,
  chats: null,
  messages: null,
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
      set({ loadingGetMessagesByChat: false, messages: payload });
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
