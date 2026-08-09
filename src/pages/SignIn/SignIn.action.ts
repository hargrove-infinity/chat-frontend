import type { ActionFunctionArgs } from "react-router-dom";
import { authClient } from "../../lib/auth";
import { useStore } from "../../state/store";
import { EMAIL_VERIFICATION_CONFIRMED } from "../../constants/routes";
import { setToken } from "../../utils/token";
import { type SignInFieldErrors, validateSignInForm } from "./SignIn.helpers";

export type SignInActionData = {
  fieldErrors?: SignInFieldErrors;
  networkErrors?: string[];
  needsVerification?: boolean;
};

export async function signInAction({
  request,
}: ActionFunctionArgs): Promise<SignInActionData> {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const fieldErrors = validateSignInForm({ email, password });

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { data, error } = await authClient.signIn.email({
    email,
    password,
  });

  if (error) {
    if (error.status === 403) {
      return {
        needsVerification: true,
        networkErrors: ["Please verify your email before signing in."],
      };
    }

    return { networkErrors: [error.message ?? "Sign in failed"] };
  }

  setToken(data.token);

  useStore.setState((state) => ({
    ...state,
    isAuthenticated: true,
    user: data.user,
  }));

  return {};
}

export async function resendVerificationEmail(email: string) {
  return authClient.sendVerificationEmail({
    email,
    callbackURL: `${window.location.origin}${EMAIL_VERIFICATION_CONFIRMED}`,
  });
}
