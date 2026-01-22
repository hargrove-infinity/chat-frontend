import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  HOME,
  LOGIN,
  CHATS,
  METRICS,
  CHATS_CONTACT_ID,
} from "../../constants/routes";
import { useStore } from "../../state/store";
import { Chats } from "../../pages/Chats/Chats";
import { Login } from "../../pages/Login/Login";
import { Metrics } from "../../pages/Metrics/Metrics";
import { getDefaultPath } from "../../utils/getDefaultPath";
import { AdminRoute } from "./AdminRoute";
import { ChatRoute } from "./ChatRoute";
import { PublicRoute } from "./PublicRoute";

export const Router = () => {
  const { isAuthenticated, isAdmin } = useStore();
  const defaultPath = getDefaultPath({ isAdmin, isAuthenticated });

  return (
    <BrowserRouter>
      <Routes>
        <Route path={HOME} element={<Navigate to={defaultPath} replace />} />
        <Route element={<PublicRoute />}>
          <Route path={LOGIN} element={<Login />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path={METRICS} element={<Metrics />} />
        </Route>
        <Route element={<ChatRoute />}>
          <Route path={CHATS} element={<Chats />} />
          <Route path={CHATS_CONTACT_ID} element={<Chats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
