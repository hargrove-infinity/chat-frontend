import { api } from "./api";
import { AUTH_ENDPOINTS } from "./endpoints";
import type { ApiPromise, AuthCredentials } from "./types";

export const loginRequest = (args: AuthCredentials): ApiPromise<string> => {
  return api.post(AUTH_ENDPOINTS.LOGIN, args);
};
