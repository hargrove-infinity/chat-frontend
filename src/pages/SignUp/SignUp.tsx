import { Form } from "react-router-dom";
import { useSignUp } from "./SignUp.hooks";
import styles from "./SignUp.module.css";

export function SignUp() {
  const {
    name,
    email,
    password,
    fieldErrors,
    networkErrors,
    isSubmitting,
    handleNameChange,
    handleEmailChange,
    handlePasswordChange,
  } = useSignUp();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create an account</h1>
        <p className={styles.subtitle}>Sign up to start chatting</p>

        <Form className={styles.form} method="post" noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              className={`${styles.input} ${
                fieldErrors.name ? styles.inputError : ""
              }`}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Jane Doe"
              disabled={isSubmitting}
            />
            {fieldErrors.name && (
              <p className={styles.fieldError}>{fieldErrors.name}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`${styles.input} ${
                fieldErrors.email ? styles.inputError : ""
              }`}
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="jane@example.com"
              disabled={isSubmitting}
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
              name="password"
              type="password"
              className={`${styles.input} ${
                fieldErrors.password ? styles.inputError : ""
              }`}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="At least 8 characters"
              disabled={isSubmitting}
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

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <span className={styles.spinner} aria-hidden="true" />
            )}
            {isSubmitting ? "Creating account..." : "Sign up"}
          </button>
        </Form>
      </div>
    </div>
  );
}
