export type EmailVerificationConfirmedFieldErrors = {
  email?: string;
  password?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Email is required";
  if (!EMAIL_REGEX.test(email)) return "Enter a valid email address";
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required";
  return undefined;
}

export function validateEmailVerificationConfirmedForm(fields: {
  email: string;
  password: string;
}): EmailVerificationConfirmedFieldErrors {
  const errors: EmailVerificationConfirmedFieldErrors = {
    email: validateEmail(fields.email),
    password: validatePassword(fields.password),
  };

  return Object.fromEntries(
    Object.entries(errors).filter(([, value]) => value !== undefined),
  );
}
