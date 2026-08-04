import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../../lib/auth";
import { EMAIL_VERIFICATION, VERIFIED } from "../../constants/routes";

export function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const { error } = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: `${window.location.origin}${VERIFIED}`,
      isAdmin: false,
    });

    if (error) {
      setError(error.message ?? "Signup failed");
      return;
    }

    navigate(EMAIL_VERIFICATION);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
      />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Email"
        required
      />

      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
        required
      />

      {error && <p>{error}</p>}

      <button type="submit">Sign up</button>
    </form>
  );
}
