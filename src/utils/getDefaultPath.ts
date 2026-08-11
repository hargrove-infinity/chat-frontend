import { SIGN_IN, CHATS, METRICS } from "../constants/routes";

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

  return SIGN_IN;
};
