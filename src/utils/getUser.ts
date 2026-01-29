import { getToken } from "./token";

type User = {
  id: string;
  socketId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

export const getUser = (): User | null => {
  const token = getToken();

  if (token) {
    const decoded = JSON.parse(atob(token));
    return decoded;
  }

  return null;
};
