import { LOGIN, CHATS, METRICS } from "../constants/routes";

export const getDefaultPath = ({
  isAuthenticated,
  isAdmin,
}: {
  isAuthenticated: boolean;
  isAdmin: boolean;
}) => {
  if (isAuthenticated && isAdmin) {
    return METRICS;
  }

  if (isAuthenticated && !isAdmin) {
    return CHATS;
  }

  return LOGIN;
};
