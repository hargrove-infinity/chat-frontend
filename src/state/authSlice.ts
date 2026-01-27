import type { StateCreator } from "zustand";
import type { AuthCredentials } from "../api/types";
import { loginRequest } from "../api/requests";
import { isApiError, isAxiosError } from "../api/utils";
import { getToken, setToken } from "../utils/token";
import { getIsAdmin } from "../utils/getIsAdmin";

export const initialAuthState = {
  errors: null,
  loadingLogin: false,
  isAuthenticated: !!getToken(),
  isAdmin: !!getIsAdmin(),
};

export interface AuthSlice {
  errors: null | string[];
  loadingLogin: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (args: AuthCredentials) => Promise<void>;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  ...initialAuthState,
  login: async (body: AuthCredentials) => {
    try {
      set({ loadingLogin: true });
      const res = await loginRequest(body);
      const { payload } = res.data;
      setToken(payload);
      const decoded = JSON.parse(atob(payload));
      set({
        loadingLogin: false,
        isAuthenticated: true,
        isAdmin: decoded.isAdmin,
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
