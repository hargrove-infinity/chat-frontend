import { Navigate, Outlet } from "react-router-dom";
import { LOGIN } from "../../constants/routes";
import { useStore } from "../../state/store";

export const AdminRoute = () => {
  const { isAuthenticated, user, isPending } = useStore();

  if (isPending) return null;

  return isAuthenticated && user?.isAdmin ? (
    <Outlet />
  ) : (
    <Navigate to={LOGIN} replace />
  );
};
