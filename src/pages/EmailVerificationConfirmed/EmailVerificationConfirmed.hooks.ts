import { useState } from "react";
import { authClient } from "../../lib/auth";
import { useStore } from "../../state/store";
import { EMAIL_VERIFICATION_CONFIRMED } from "../../constants/routes";
import { setToken } from "../../utils/token";
import {
  type EmailVerificationConfirmedFieldErrors,
  validateEmailVerificationConfirmedForm,
} from "./EmailVerificationConfirmed.helpers";

export function useEmailVerificationConfirmed() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fieldErrors, setFieldErrors] =
    useState<EmailVerificationConfirmedFieldErrors>({});

  const [networkErrors, setNetworkErrors] = useState<string[] | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [needsVerification, setNeedsVerification] = useState(false);

  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">(
    "idle",
  );

  function clearFieldError(field: keyof EmailVerificationConfirmedFieldErrors) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;

      const next = { ...prev };
      delete next[field];

      return next;
    });
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    clearFieldError("email");
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    clearFieldError("password");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setNetworkErrors(null);
    setNeedsVerification(false);

    const errors = validateEmailVerificationConfirmedForm({
      email,
      password,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      if (error.status === 403) {
        setNeedsVerification(true);
        setNetworkErrors(["Please verify your email before signing in."]);
        return;
      }

      setNetworkErrors([error.message ?? "Sign in failed"]);
      return;
    }

    setToken(data.token);

    useStore.setState((state) => ({
      ...state,
      isAuthenticated: true,
      isAdmin: data.user.isAdmin,
    }));
  }

  async function handleResendVerification() {
    if (resendStatus !== "idle") return;

    setResendStatus("sending");

    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: `${window.location.origin}${EMAIL_VERIFICATION_CONFIRMED}`,
    });

    if (error) {
      setNetworkErrors([
        error.message ?? "Failed to resend verification email",
      ]);
      setResendStatus("idle");
      return;
    }

    setResendStatus("sent");
  }

  return {
    email,
    password,
    fieldErrors,
    networkErrors,
    isSubmitting,
    needsVerification,
    resendStatus,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    handleResendVerification,
  };
}
