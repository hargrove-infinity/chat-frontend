import { Navigate, Outlet } from "react-router-dom";
import { LOGIN } from "../../constants/routes";
import { useStore } from "../../state/store";

export const ChatRoute = () => {
  const { isAuthenticated, isAdmin } = useStore();

  return isAuthenticated && !isAdmin ? (
    <Outlet />
  ) : (
    <Navigate to={LOGIN} replace />
  );
};
