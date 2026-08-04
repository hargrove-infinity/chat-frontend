import { useState } from "react";
import { authClient } from "../../lib/auth";
import { useStore } from "../../state/store";
import { VERIFIED } from "../../constants/routes";
import { setToken } from "../../utils/token";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">(
    "idle",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);

    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      if (error.status === 403) {
        // account exists, credentials are correct, but email isn't verified yet
        setNeedsVerification(true);
        setError("Please verify your email before signing in.");
        return;
      }

      setError(error.message ?? "Sign in failed");
      return;
    }

    setToken(data.token);

    useStore.setState((state) => {
      return {
        ...state,
        isAuthenticated: true,
        isAdmin: data.user.isAdmin,
      };
    });
  }

  async function handleResendVerification() {
    setResendStatus("sending");

    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: `${window.location.origin}${VERIFIED}`,
    });

    setResendStatus(error ? "idle" : "sent");
  }

  return (
    <form onSubmit={handleSubmit}>
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

      {needsVerification && (
        <button
          type="button"
          onClick={handleResendVerification}
          disabled={resendStatus !== "idle"}
        >
          {resendStatus === "sent"
            ? "Verification email sent"
            : "Resend verification email"}
        </button>
      )}

      <button type="submit">Sign in</button>
    </form>
  );
}
