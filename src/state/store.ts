import { create } from "zustand";
import { deleteToken } from "../utils/token";
import { createAuthSlice, initialAuthState, type AuthSlice } from "./authSlice";
import {
  createChatsSlice,
  initialChatsState,
  type ChatsSlice,
} from "./chatsSlice";

type StoreState = AuthSlice &
  ChatsSlice & {
    logout: () => void;
  };

export const useStore = create<StoreState>()((set, get, api) => ({
  ...createAuthSlice(set, get, api),
  ...createChatsSlice(set, get, api),
  logout: () => {
    set({ ...initialAuthState, ...initialChatsState });
    deleteToken();
  },
}));
