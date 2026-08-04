import type { StateCreator } from "zustand";
import type { AuthCredentials } from "../api/types";
import { loginRequest } from "../api/requests";
import { isApiError, isAxiosError } from "../api/utils";
import { getToken, setToken } from "../utils/token";
import type { StripEmptyObjects } from "better-auth";
import type { StoreState } from "./store";

export const initialAuthState = {
  errors: null,
  loadingLogin: false,
  isAuthenticated: !!getToken(),
  user: null,
  isPending: false,
};

export interface AuthSlice {
  errors: null | string[];
  loadingLogin: boolean;
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
  login: (args: AuthCredentials) => Promise<void>;
}

export const createAuthSlice: StateCreator<StoreState, [], [], AuthSlice> = (
  set,
) => ({
  ...initialAuthState,
  login: async (body: AuthCredentials) => {
    try {
      set({ loadingLogin: true });
      const res = await loginRequest(body);
      const { payload } = res.data;
      setToken(payload);

      set({
        loadingLogin: false,
        isAuthenticated: true,
      });
    } catch (error) {
      set({ loadingLogin: false });

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
