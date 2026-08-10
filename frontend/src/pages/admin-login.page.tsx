import { useState } from "react";

interface AdminLoginPageProps {
  onLogin: (token: string) => void;
}

export default function AdminLoginPage({ onLogin }: AdminLoginPageProps) {
  const [token, setToken] = useState("");

  return (
    <section className="card">
      <h2>Admin login</h2>
      <p>Enter your admin token to access the management console.</p>
      <label className="form-field">
        <span>Admin token</span>
        <input
          className="input"
          type="password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Enter admin token"
        />
      </label>
      <button className="button" type="button" onClick={() => onLogin(token)}>
        Sign in
      </button>
    </section>
  );
}
