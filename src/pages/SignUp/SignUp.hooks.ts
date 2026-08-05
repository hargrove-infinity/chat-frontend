import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../../lib/auth";
import {
  EMAIL_VERIFICATION_CONFIRMED,
  EMAIL_VERIFICATION_PENDING,
} from "../../constants/routes";
import { type SignUpFieldErrors, validateSignUpForm } from "./SignUp.helpers";

export function useSignUp() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});
  const [networkErrors, setNetworkErrors] = useState<string[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNetworkErrors(null);

    const errors = validateSignUpForm({ name, email, password });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: `${window.location.origin}${EMAIL_VERIFICATION_CONFIRMED}`,
      isAdmin: false,
    });

    setIsSubmitting(false);

    if (error) {
      setNetworkErrors([error.message ?? "Signup failed"]);
      return;
    }

    navigate(EMAIL_VERIFICATION_PENDING);
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
    handleSubmit,
  };
}
