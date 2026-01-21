import { useState } from "react";
import { useStore } from "../../state/store";

export const Login = () => {
  const { login } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <p>Login</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          login({ email, password });
        }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={({ target }) => {
            setEmail(target.value);
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={({ target }) => {
            setPassword(target.value);
          }}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};
