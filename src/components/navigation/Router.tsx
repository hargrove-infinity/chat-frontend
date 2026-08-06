import {
  Route,
  Navigate,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import {
  HOME,
  CHATS,
  METRICS,
  CHATS_CONTACT_ID,
  SIGN_UP,
  EMAIL_VERIFICATION_CONFIRMED,
  SIGN_IN,
  EMAIL_VERIFICATION_PENDING,
} from "../../constants/routes";
import { useStore } from "../../state/store";
import { Chats } from "../../pages/Chats/Chats";
import { SignUp } from "../../pages/SignUp/SignUp";
import { Metrics } from "../../pages/Metrics/Metrics";
import { getDefaultPath } from "../../utils/getDefaultPath";
import { AdminRoute } from "./AdminRoute";
import { ChatRoute } from "./ChatRoute";
import { PublicRoute } from "./PublicRoute";
import { EmailVerificationConfirmed } from "../../pages/EmailVerificationConfirmed/EmailVerificationConfirmed";
import { SignIn } from "../../pages/SignIn/SignIn";
import { EmailVerificationPending } from "../../pages/EmailVerificationPending/EmailVerificationPending";
import { signUpAction } from "../../pages/SignUp/SignUp.action";
import { emailVerificationConfirmedAction } from "../../pages/EmailVerificationConfirmed/EmailVerificationConfirmed.action";
import { signInAction } from "../../pages/SignIn/SignIn.action";

const HomeRedirect = () => {
  const { isAuthenticated, user } = useStore();

  const defaultPath = getDefaultPath({
    isAdmin: !!user?.isAdmin,
    isAuthenticated,
  });

  return <Navigate to={defaultPath} replace />;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path={HOME} element={<HomeRedirect />} />
      <Route element={<PublicRoute />}>
        <Route path={SIGN_UP} element={<SignUp />} action={signUpAction} />
        <Route
          path={EMAIL_VERIFICATION_PENDING}
          element={<EmailVerificationPending />}
        />
        <Route path={SIGN_IN} element={<SignIn />} action={signInAction} />
        <Route
          path={EMAIL_VERIFICATION_CONFIRMED}
          element={<EmailVerificationConfirmed />}
          action={emailVerificationConfirmedAction}
        />
      </Route>
      <Route element={<AdminRoute />}>
        <Route path={METRICS} element={<Metrics />} />
      </Route>
      <Route element={<ChatRoute />}>
        <Route path={CHATS} element={<Chats />} />
        <Route path={CHATS_CONTACT_ID} element={<Chats />} />
      </Route>
    </>,
  ),
);

export const Router = () => <RouterProvider router={router} />;
