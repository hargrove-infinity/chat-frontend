import type { ActionFunctionArgs } from "react-router-dom";
import { authClient } from "../../lib/auth";
import { useStore } from "../../state/store";
import { setToken } from "../../utils/token";
import {
  type EmailVerificationConfirmedFieldErrors,
  validateEmailVerificationConfirmedForm,
} from "./EmailVerificationConfirmed.helpers";

export type EmailVerificationConfirmedActionData = {
  fieldErrors?: EmailVerificationConfirmedFieldErrors;
  networkErrors?: string[];
  needsVerification?: boolean;
};

export async function emailVerificationConfirmedAction({
  request,
}: ActionFunctionArgs): Promise<EmailVerificationConfirmedActionData> {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const fieldErrors = validateEmailVerificationConfirmedForm({
    email,
    password,
  });

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
