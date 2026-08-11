export type SignUpFieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(name: string): string | undefined {
  if (!name.trim()) return "Name is required";
  return undefined;
}

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Email is required";
  if (!EMAIL_REGEX.test(email)) return "Enter a valid email address";
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain at least one letter and one number";
  }
  return undefined;
}

export function validateSignUpForm(fields: {
  name: string;
  email: string;
  password: string;
}): SignUpFieldErrors {
  const errors: SignUpFieldErrors = {
    name: validateName(fields.name),
    email: validateEmail(fields.email),
    password: validatePassword(fields.password),
  };

  return Object.fromEntries(
    Object.entries(errors).filter(([, value]) => value !== undefined),
  );
}
