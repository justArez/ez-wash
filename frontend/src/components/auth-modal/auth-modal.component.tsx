import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  XCircle,
} from "lucide-react";
import { checkUsernameAvailability } from "../../services/loyalty.service";
import "./auth-modal.component.scss";
import type {
  LinkAccountRequest,
  LoginCredentials,
} from "../../models/customer.model";

export type { LoginCredentials };

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return (
    /^[+]?[\d\s\-().]{7,20}$/.test(phone.trim()) &&
    digits.length >= 7 &&
    digits.length <= 15
  );
}

interface PasswordRules {
  minLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
}

function getPasswordRules(password: string): PasswordRules {
  return {
    minLength: password.length >= 6,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
}

function isPasswordValid(rules: PasswordRules): boolean {
  return rules.minLength && rules.hasLetter && rules.hasNumber;
}

interface AuthModalProps {
  visible: boolean;
  mode: "sign-in" | "sign-up";
  onClose: () => void;
  onSignIn: (username: string, password: string) => Promise<void> | void;
  onSignUp: (payload: LinkAccountRequest) => Promise<void> | void;
  onToggleMode: (mode: "sign-in" | "sign-up") => void;
}

type UsernameCheckStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid";

export default function AuthModal({
  visible,
  mode,
  onClose,
  onSignIn,
  onSignUp,
  onToggleMode,
}: AuthModalProps) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameStatus, setUsernameStatus] =
    useState<UsernameCheckStatus>("idle");
  const [usernameMessage, setUsernameMessage] = useState<string>("");

  const passwordRules = getPasswordRules(password);
  const isPasswordStrong = isPasswordValid(passwordRules);

  // Debounced real-time username duplication check for Sign-Up mode
  useEffect(() => {
    if (mode !== "sign-up") {
      return;
    }

    const trimmed = username.trim().toLowerCase();
    if (!trimmed) {
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      if (trimmed.length < 3) {
        if (isMounted) {
          setUsernameStatus("invalid");
          setUsernameMessage("Must be at least 3 characters");
        }
        return;
      }

      if (isMounted) {
        setUsernameStatus("checking");
        setUsernameMessage("Checking availability...");
      }

      try {
        const result = await checkUsernameAvailability(trimmed);
        if (!isMounted) return;

        if (result.available) {
          setUsernameStatus("available");
          setUsernameMessage("Username is available");
        } else {
          setUsernameStatus("taken");
          setUsernameMessage("Username is already taken");
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn("Username availability check failed:", err);
        setUsernameStatus("idle");
        setUsernameMessage("");
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [username, mode]);

  if (!visible) {
    return null;
  }

  const handleSubmit = async () => {
    setError(null);

    if (mode === "sign-in") {
      const loginIdentifier = (username || phone).trim();
      if (!loginIdentifier) {
        setError("Please enter your username or phone number to sign in.");
        return;
      }
      if (!password.trim()) {
        setError("Please enter your password to sign in.");
        return;
      }

      // If login identifier doesn't look like a phone number (i.e. is a username/email), lowercase it
      const isDigitsOnly = /^[+]?[\d\s\-().]+$/.test(loginIdentifier);
      const normalizedIdentifier = isDigitsOnly
        ? loginIdentifier
        : loginIdentifier.toLowerCase();

      try {
        setIsSubmitting(true);
        await onSignIn(normalizedIdentifier, password.trim());
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to sign in. Please check your credentials.",
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Sign-up validations
    const trimmedFullName = fullName.trim();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!trimmedUsername) {
      setError("Username is required.");
      return;
    }

    if (trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (usernameStatus === "taken") {
      setError("Username is already taken. Please choose another username.");
      return;
    }

    if (!trimmedPassword) {
      setError("Password is required.");
      return;
    }

    const currentRules = getPasswordRules(trimmedPassword);
    if (!currentRules.minLength) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!currentRules.hasLetter) {
      setError("Password must contain at least one letter.");
      return;
    }

    if (!currentRules.hasNumber) {
      setError("Password must contain at least one number.");
      return;
    }

    if (!trimmedConfirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!trimmedEmail && !trimmedPhone) {
      setError("Please enter at least an email or a phone number.");
      return;
    }

    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address (e.g. user@example.com).");
      return;
    }

    if (trimmedPhone && !isValidPhone(trimmedPhone)) {
      setError(
        "Please enter a valid phone number (e.g. 555-0100 or 0901234567).",
      );
      return;
    }

    // Double check availability before final submit if not already confirmed
    if (usernameStatus !== "available") {
      try {
        const check = await checkUsernameAvailability(trimmedUsername);
        if (!check.available) {
          setUsernameStatus("taken");
          setUsernameMessage("Username is already taken");
          setError(
            "Username is already taken. Please choose a different username.",
          );
          return;
        }
      } catch (err) {
        console.warn("Double check error on submit:", err);
      }
    }

    try {
      setIsSubmitting(true);
      await onSignUp({
        fullName: trimmedFullName || undefined,
        username: trimmedUsername,
        password: trimmedPassword,
        email: trimmedEmail || undefined,
        phone: trimmedPhone || undefined,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeSwitch = (newMode: "sign-in" | "sign-up") => {
    setError(null);
    setUsernameStatus("idle");
    setUsernameMessage("");
    onToggleMode(newMode);
  };

  return (
    <div className="modal-overlay">
      <div className="modal card auth-modal">
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <div className="auth-header">
          <h2>{mode === "sign-in" ? "Sign In" : "Sign Up"}</h2>
          <p>
            {mode === "sign-in"
              ? "Continue with your username/phone and password."
              : "Create your EzWash account and start booking."}
          </p>
        </div>

        {error && <div className="status-message error">{error}</div>}

        <div className="form-grid auth-grid">
          {mode === "sign-in" ? (
            <>
              {/* Sign In Row 1: Username or Phone */}
              <label className="form-field form-field--full">
                <span className="form-field__label">Username or Phone</span>
                <input
                  className="input"
                  value={username || phone}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setPhone(event.target.value);
                  }}
                  placeholder="Enter your username or phone"
                  autoComplete="username"
                />
              </label>

              {/* Sign In Row 2: Password */}
              <div className="form-field form-field--full">
                <label className="form-field__label" htmlFor="signin-password">
                  Password
                </label>
                <div className="form-field__input-wrap">
                  <input
                    id="signin-password"
                    className="input input--with-toggle"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Sign Up Row 1: Full Name (Full 1 row) */}
              <label className="form-field form-field--full">
                <span className="form-field__label">Full Name</span>
                <input
                  className="input"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="e.g. John Doe"
                  autoComplete="name"
                />
              </label>

              {/* Sign Up Row 2: Username with duplicate check (Full 1 row) */}
              <div className="form-field form-field--full">
                <div className="form-field__label-row">
                  <label
                    htmlFor="signup-username"
                    className="form-field__label"
                  >
                    Username *
                  </label>
                  {usernameStatus !== "idle" && (
                    <span
                      className={`form-field__status form-field__status--${usernameStatus}`}
                    >
                      {usernameStatus === "checking" && (
                        <Loader2 size={16} className="spin-icon" />
                      )}
                      {usernameStatus === "available" && (
                        <CheckCircle2 size={16} />
                      )}
                      {(usernameStatus === "taken" ||
                        usernameStatus === "invalid") && (
                        <AlertCircle size={16} />
                      )}
                      {usernameMessage}
                    </span>
                  )}
                </div>
                <div className="form-field__input-wrap">
                  <input
                    id="signup-username"
                    className={`input ${
                      usernameStatus === "taken" || usernameStatus === "invalid"
                        ? "input--error"
                        : usernameStatus === "available"
                          ? "input--success"
                          : ""
                    }`}
                    value={username}
                    onChange={(event) => {
                      const val = event.target.value;
                      setUsername(val);
                      if (!val.trim()) {
                        setUsernameStatus("idle");
                        setUsernameMessage("");
                      }
                    }}
                    placeholder="Choose a unique username"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Sign Up Row 2: Password and Confirm Password in 1 row (2 cols) */}
              <div className="form-field form-field--half">
                <div className="form-field__label-row">
                  <label
                    htmlFor="signup-password"
                    className="form-field__label"
                  >
                    Password *
                  </label>
                  {password && (
                    <span
                      className={`form-field__status form-field__status--${
                        isPasswordStrong ? "available" : "taken"
                      }`}
                    >
                      {isPasswordStrong ? (
                        <>
                          <CheckCircle2 size={16} /> Strong
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} /> Needs work
                        </>
                      )}
                    </span>
                  )}
                </div>
                <div className="form-field__input-wrap">
                  <input
                    id="signup-password"
                    className={`input input--with-toggle ${
                      password && !isPasswordStrong
                        ? "input--error"
                        : password
                          ? "input--success"
                          : ""
                    }`}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-field form-field--half">
                <div className="form-field__label-row">
                  <label
                    htmlFor="signup-confirm-password"
                    className="form-field__label"
                  >
                    Confirm Password *
                  </label>
                  {confirmPassword && (
                    <span
                      className={`form-field__status form-field__status--${
                        password === confirmPassword ? "available" : "taken"
                      }`}
                    >
                      {password === confirmPassword ? (
                        <>
                          <CheckCircle2 size={16} /> Match
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} /> No match
                        </>
                      )}
                    </span>
                  )}
                </div>
                <div className="form-field__input-wrap">
                  <input
                    id="signup-confirm-password"
                    className={`input input--with-toggle ${
                      confirmPassword && password !== confirmPassword
                        ? "input--error"
                        : confirmPassword && password === confirmPassword
                          ? "input--success"
                          : ""
                    }`}
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements helper checklist (Full width) */}
              <div className="form-field form-field--full password-requirements">
                <div className="password-requirements__title">
                  Password Requirements:
                </div>
                <div className="password-requirements__list">
                  <div
                    className={`password-requirement-item ${
                      passwordRules.minLength ? "is-met" : ""
                    }`}
                  >
                    {passwordRules.minLength ? (
                      <CheckCircle2
                        size={14}
                        className="req-icon req-icon--met"
                      />
                    ) : (
                      <XCircle size={14} className="req-icon req-icon--unmet" />
                    )}
                    <span>At least 6 characters</span>
                  </div>
                  <div
                    className={`password-requirement-item ${
                      passwordRules.hasLetter ? "is-met" : ""
                    }`}
                  >
                    {passwordRules.hasLetter ? (
                      <CheckCircle2
                        size={14}
                        className="req-icon req-icon--met"
                      />
                    ) : (
                      <XCircle size={14} className="req-icon req-icon--unmet" />
                    )}
                    <span>Contains at least 1 letter</span>
                  </div>
                  <div
                    className={`password-requirement-item ${
                      passwordRules.hasNumber ? "is-met" : ""
                    }`}
                  >
                    {passwordRules.hasNumber ? (
                      <CheckCircle2
                        size={14}
                        className="req-icon req-icon--met"
                      />
                    ) : (
                      <XCircle size={14} className="req-icon req-icon--unmet" />
                    )}
                    <span>Contains at least 1 number</span>
                  </div>
                </div>
              </div>

              {/* Sign Up Row 3: Email and Phone in 1 row (2 cols) */}
              <label className="form-field form-field--half">
                <div className="form-field__label-row">
                  <span className="form-field__label">
                    Email {!phone.trim() ? "*" : "(Optional)"}
                  </span>
                  {email.trim() && !isValidEmail(email) && (
                    <span className="form-field__status form-field__status--taken">
                      Invalid format
                    </span>
                  )}
                  {email.trim() && isValidEmail(email) && (
                    <span className="form-field__status form-field__status--available">
                      <CheckCircle2 size={16} />
                    </span>
                  )}
                </div>
                <input
                  className={`input ${
                    email.trim() && !isValidEmail(email) ? "input--error" : ""
                  }`}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={
                    phone.trim() ? "Optional email address" : "user@example.com"
                  }
                  autoComplete="email"
                />
              </label>

              <label className="form-field form-field--half">
                <div className="form-field__label-row">
                  <span className="form-field__label">
                    Phone {!email.trim() ? "*" : "(Optional)"}
                  </span>
                  {phone.trim() && !isValidPhone(phone) && (
                    <span className="form-field__status form-field__status--taken">
                      Invalid format
                    </span>
                  )}
                  {phone.trim() && isValidPhone(phone) && (
                    <span className="form-field__status form-field__status--available">
                      <CheckCircle2 size={16} />
                    </span>
                  )}
                </div>
                <input
                  className={`input ${
                    phone.trim() && !isValidPhone(phone) ? "input--error" : ""
                  }`}
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder={
                    email.trim() ? "Optional phone number" : "e.g. 555-0100"
                  }
                  autoComplete="tel"
                />
              </label>
            </>
          )}
        </div>

        <div className="modal-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              handleModeSwitch(mode === "sign-in" ? "sign-up" : "sign-in")
            }
          >
            {mode === "sign-in"
              ? "Create an account"
              : "Already have an account? Sign in"}
          </button>
          <button
            className="button"
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (mode === "sign-up" &&
                (usernameStatus === "checking" || usernameStatus === "taken"))
            }
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "sign-in"
                ? "Sign In"
                : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}
