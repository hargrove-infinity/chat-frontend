import { create } from "zustand";
import { deleteToken } from "../utils/token";
import { createAppSlice, initialAppState, type AppSlice } from "./appSlice";
import { createAuthSlice, initialAuthState, type AuthSlice } from "./authSlice";
import {
  createChatsSlice,
  initialChatsState,
  type ChatsSlice,
} from "./chatsSlice";

type StoreState = AppSlice &
  AuthSlice &
  ChatsSlice & {
    logout: () => void;
  };

export const useStore = create<StoreState>()((set, get, api) => ({
  ...createAppSlice(set, get, api),
  ...createAuthSlice(set, get, api),
  ...createChatsSlice(set, get, api),
  logout: () => {
    const { chatSocket } = get();

    if (chatSocket?.connected) {
      chatSocket.disconnect();
    }

    set({ ...initialAppState, ...initialAuthState, ...initialChatsState });
    deleteToken();
  },
}));
