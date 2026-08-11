import { useEffect, useState } from "react";
import { useActionData, useNavigation } from "react-router-dom";
import { authClient } from "../../lib/auth";
import { EMAIL_VERIFICATION_CONFIRMED } from "../../constants/routes";
import { type EmailVerificationConfirmedFieldErrors } from "./EmailVerificationConfirmed.helpers";
import type { EmailVerificationConfirmedActionData } from "./EmailVerificationConfirmed.action";

export function useEmailVerificationConfirmed() {
  const actionData = useActionData() as
    | EmailVerificationConfirmedActionData
    | undefined;
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fieldErrors, setFieldErrors] =
    useState<EmailVerificationConfirmedFieldErrors>({});

  const [networkErrors, setNetworkErrors] = useState<string[] | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">(
    "idle",
  );

  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    setFieldErrors(actionData?.fieldErrors ?? {});
    setNetworkErrors(actionData?.networkErrors ?? null);
    setNeedsVerification(actionData?.needsVerification ?? false);
  }, [actionData]);

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
    handleResendVerification,
  };
}
