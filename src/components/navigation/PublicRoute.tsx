import { Navigate, Outlet } from "react-router-dom";
import { CHATS, METRICS } from "../../constants/routes";
import { useStore } from "../../state/store";

export const PublicRoute = () => {
  const { isAuthenticated, isAdmin } = useStore();

  return isAuthenticated ? (
    <Navigate to={isAdmin ? METRICS : CHATS} replace />
  ) : (
    <Outlet />
  );
};
