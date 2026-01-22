import { create } from "zustand";
import { createAuthSlice, type AuthSlice } from "./authSlice";

type StoreState = AuthSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
}));
