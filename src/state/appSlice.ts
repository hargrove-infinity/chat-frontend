import type { StateCreator } from "zustand";
import type { ChatSocket } from "./appSlice.types";

export const initialAppState = {
  chatSocket: null,
};

export interface AppSlice {
  chatSocket: ChatSocket | null;
  setChatSocket: (socket: ChatSocket | null) => void;
}

export const createAppSlice: StateCreator<AppSlice> = (set) => ({
  ...initialAppState,
  setChatSocket: (socket: ChatSocket | null) => {
    set({ chatSocket: socket });
  },
});
