import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  HOME,
  CHATS,
  METRICS,
  CHATS_CONTACT_ID,
  SIGN_UP,
  VERIFIED,
  SIGN_IN,
} from "../../constants/routes";
import { useStore } from "../../state/store";
import { Chats } from "../../pages/Chats/Chats";
import { SignUp } from "../../pages/SignUp/SignUp";
import { Metrics } from "../../pages/Metrics/Metrics";
import { getDefaultPath } from "../../utils/getDefaultPath";
import { AdminRoute } from "./AdminRoute";
import { ChatRoute } from "./ChatRoute";
import { PublicRoute } from "./PublicRoute";
import { Verified } from "../../pages/Verified/Verified";
import { SignIn } from "../../pages/SignIn/SignIn";

export const Router = () => {
  const { isAuthenticated, user } = useStore();

  const defaultPath = getDefaultPath({
    isAdmin: !!user?.isAdmin,
    isAuthenticated,
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route path={HOME} element={<Navigate to={defaultPath} replace />} />
        <Route element={<PublicRoute />}>
          <Route path={SIGN_UP} element={<SignUp />} />
          <Route path={SIGN_IN} element={<SignIn />} />
          <Route path={VERIFIED} element={<Verified />} />
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
