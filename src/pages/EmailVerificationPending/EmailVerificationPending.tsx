import styles from "./EmailVerificationPending.module.css";

export function EmailVerificationPending() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 6h16v12H4z" />
            <path d="M4 7l8 6 8-6" />
          </svg>
        </div>

        <h1 className={styles.title}>Check your email</h1>

        <p className={styles.description}>
          We have sent a verification email to your inbox.
          <br />
          <br />
          Open the email and click the verification link to confirm your
          account.
          <br />
          <br />
          Once your email is verified, you will be able to sign in.
        </p>

        <div className={styles.note}>
          <span className={styles.highlight}>Didn't receive the email?</span>
          <br />
          Check your spam or junk folder.
        </div>

        <div className={styles.note}>
          You can safely close this page and return after verifying your email.
        </div>
      </div>
    </div>
  );
}
