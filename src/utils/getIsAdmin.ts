import { getToken } from "./token";

export const getIsAdmin = (): boolean | null => {
  const token = getToken();

  if (token) {
    const decoded = JSON.parse(atob(token));
    return decoded.isAdmin;
  }

  return null;
};
