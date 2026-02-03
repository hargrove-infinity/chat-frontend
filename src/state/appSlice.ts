import type { StateCreator } from "zustand";
import { Socket } from "socket.io-client";

export const initialAppState = {
  chatSocket: null,
};

export interface AppSlice {
  chatSocket: Socket | null;
  setChatSocket: (socket: Socket | null) => void;
}

export const createAppSlice: StateCreator<AppSlice> = (set) => ({
  ...initialAppState,
  setChatSocket: (socket: Socket | null) => {
    set({ chatSocket: socket });
  },
});
