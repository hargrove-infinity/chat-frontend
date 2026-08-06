import { useEffect, useState } from "react";
import { useActionData, useNavigation } from "react-router-dom";
import { type SignUpFieldErrors } from "./SignUp.helpers";
import type { SignUpActionData } from "./SignUp.action";

export function useSignUp() {
  const actionData = useActionData() as SignUpActionData | undefined;
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});
  const [networkErrors, setNetworkErrors] = useState<string[] | null>(null);

  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    setFieldErrors(actionData?.fieldErrors ?? {});
    setNetworkErrors(actionData?.networkErrors ?? null);
  }, [actionData]);

  function clearFieldError(field: keyof SignUpFieldErrors) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleNameChange(value: string) {
    setName(value);
    clearFieldError("name");
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    clearFieldError("email");
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    clearFieldError("password");
  }

  return {
    name,
    email,
    password,
    fieldErrors,
    networkErrors,
    isSubmitting,
    handleNameChange,
    handleEmailChange,
    handlePasswordChange,
  };
}
