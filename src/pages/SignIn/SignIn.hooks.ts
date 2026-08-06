import { useEffect, useState } from "react";
import { useActionData, useNavigation } from "react-router-dom";
import { type SignInFieldErrors } from "./SignIn.helpers";
import type { SignInActionData } from "./SignIn.action";
import { resendVerificationEmail } from "./SignIn.action";

export function useSignIn() {
  const actionData = useActionData() as SignInActionData | undefined;
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<SignInFieldErrors>({});
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

  function clearFieldError(field: keyof SignInFieldErrors) {
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
    if (resendStatus !== "idle") {
      return;
    }

    setResendStatus("sending");

    const { error } = await resendVerificationEmail(email);

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
