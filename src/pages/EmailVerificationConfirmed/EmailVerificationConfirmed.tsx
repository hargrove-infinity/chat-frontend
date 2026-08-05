import styles from "./EmailVerificationConfirmed.module.css";
import { useEmailVerificationConfirmed } from "./EmailVerificationConfirmed.hooks";

export function EmailVerificationConfirmed() {
  const {
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
  } = useEmailVerificationConfirmed();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Email verified!</h1>

        <p className={styles.subtitle}>
          Your email has been successfully verified. Sign in to continue.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              disabled={isSubmitting}
              placeholder="jane@example.com"
              className={`${styles.input} ${
                fieldErrors.email ? styles.inputError : ""
              }`}
              onChange={(e) => handleEmailChange(e.target.value)}
            />

            {fieldErrors.email && (
              <p className={styles.fieldError}>{fieldErrors.email}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              disabled={isSubmitting}
              placeholder="Enter your password"
              className={`${styles.input} ${
                fieldErrors.password ? styles.inputError : ""
              }`}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />

            {fieldErrors.password && (
              <p className={styles.fieldError}>{fieldErrors.password}</p>
            )}
          </div>

          {networkErrors && networkErrors.length > 0 && (
            <div className={styles.networkErrors}>
              {networkErrors.map((err, idx) => (
                <p className={styles.networkErrorItem} key={`${err}-${idx}`}>
                  {err}
                </p>
              ))}
            </div>
          )}

          {needsVerification && (
            <div className={styles.verificationSection}>
              <button
                type="button"
                className={styles.verificationButton}
                onClick={handleResendVerification}
                disabled={resendStatus !== "idle" || isSubmitting}
              >
                {resendStatus === "sending" && (
                  <span className={styles.spinner} aria-hidden="true" />
                )}

                {resendStatus === "sending"
                  ? "Sending..."
                  : resendStatus === "sent"
                    ? "Verification email sent"
                    : "Resend verification email"}
              </button>
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <span className={styles.spinner} aria-hidden="true" />
            )}

            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
