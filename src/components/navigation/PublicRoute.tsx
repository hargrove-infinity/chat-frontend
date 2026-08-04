import { Navigate, Outlet } from "react-router-dom";
import { CHATS, METRICS } from "../../constants/routes";
import { useStore } from "../../state/store";

export const PublicRoute = () => {
  const { isAuthenticated, user, isPending } = useStore();

  if (isPending) return null;

  return isAuthenticated ? (
    <Navigate to={user?.isAdmin ? METRICS : CHATS} replace />
  ) : (
    <Outlet />
  );
};
