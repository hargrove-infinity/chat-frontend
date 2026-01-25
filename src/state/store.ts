import { create } from "zustand";
import { createAuthSlice, type AuthSlice } from "./authSlice";
import { createChatsSlice, type ChatsSlice } from "./chatsSlice";

type StoreState = AuthSlice & ChatsSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createChatsSlice(...a),
}));
