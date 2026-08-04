import type { StateCreator } from "zustand";
import { getToken } from "../utils/token";
import type { StripEmptyObjects } from "better-auth";
import type { StoreState } from "./store";

export const initialAuthState = {
  isAuthenticated: !!getToken(),
  user: null,
  isPending: false,
};

export interface AuthSlice {
  isAuthenticated: boolean;
  isPending: boolean;
  user:
    | StripEmptyObjects<
        {
          id: string;
          createdAt: Date;
          updatedAt: Date;
          email: string;
          emailVerified: boolean;
          name: string;
          image?: string | null | undefined;
        } & {
          isAdmin: boolean;
        } & {}
      >
    | undefined
    | null;
}

export const createAuthSlice: StateCreator<
  StoreState,
  [],
  [],
  AuthSlice
> = () => ({
  ...initialAuthState,
});
