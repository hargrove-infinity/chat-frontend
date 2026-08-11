import { useEffect } from "react";
import { authClient } from "../../lib/auth";
import { deleteToken } from "../../utils/token";
import { useStore } from "../../state/store";

type Session = ReturnType<typeof authClient.useSession>["data"];

const resolveAuthState = (session: Session) => {
  if (!session) {
    deleteToken();
    return { user: null, isAuthenticated: false };
  }

  return { user: session.user, isAuthenticated: true };
};

export const AuthSync = () => {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    useStore.setState({ ...resolveAuthState(session), isPending });
  }, [session, isPending]);

  return null;
};
