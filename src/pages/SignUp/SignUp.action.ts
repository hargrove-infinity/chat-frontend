import { redirect, type ActionFunctionArgs } from "react-router-dom";
import { authClient } from "../../lib/auth";
import {
  EMAIL_VERIFICATION_CONFIRMED,
  EMAIL_VERIFICATION_PENDING,
} from "../../constants/routes";
import { validateSignUpForm, type SignUpFieldErrors } from "./SignUp.helpers";

export type SignUpActionData = {
  fieldErrors?: SignUpFieldErrors;
  networkErrors?: string[];
};

export async function signUpAction({
  request,
}: ActionFunctionArgs): Promise<SignUpActionData | Response> {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const fieldErrors = validateSignUpForm({ name, email, password });

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await authClient.signUp.email({
    email,
    password,
    name,
    callbackURL: `${window.location.origin}${EMAIL_VERIFICATION_CONFIRMED}`,
    isAdmin: false,
  });

  if (error) {
    return { networkErrors: [error.message ?? "Signup failed"] };
  }

  return redirect(EMAIL_VERIFICATION_PENDING);
}
