import { create } from "zustand";
import { deleteToken } from "../utils/token";
import { createAuthSlice, type AuthSlice } from "./authSlice";
import { createChatsSlice, type ChatsSlice } from "./chatsSlice";

type StoreState = AuthSlice &
  ChatsSlice & {
    logout: () => void;
  };

export const useStore = create<StoreState>()((set, get, api) => ({
  ...createAuthSlice(set, get, api),
  ...createChatsSlice(set, get, api),
  logout: () => {
    set({
      isAuthenticated: false,
      isAdmin: false,
      chats: null,
      messages: null,
    });
    deleteToken();
  },
}));
