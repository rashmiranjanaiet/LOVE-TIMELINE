import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth-context.jsx";

const initialSignupState = {
  displayName: "",
  partnerName: "",
  partnerEmail: "",
  email: "",
  password: "",
  relationshipStartDate: "",
  loveMessageOptIn: true
};

const initialLoginState = {
  email: "",
  password: ""
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(initialLoginState);
  const [signupForm, setSignupForm] = useState(initialSignupState);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (mode === "login") {
        await login(loginForm);
      } else {
        await signup(signupForm);
      }

      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-shell auth-shell">
      <section className="auth-intro">
        <p className="eyebrow">Secure account access</p>
        <h1>Build a private home for your memories.</h1>
        <p>
          Create a couple profile, save your first date, upload photos and videos, and keep your
          anniversary countdown visible every time you sign in.
        </p>
        <Link className="text-link" to="/">
          Back to home
        </Link>
      </section>

      <section className="auth-card">
        <div className="mode-switch">
          <button
            className={mode === "login" ? "mode-button active" : "mode-button"}
            type="button"
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={mode === "signup" ? "mode-button active" : "mode-button"}
            type="button"
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <form className="stack-form" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <>
              <label>
                Your name
                <input
                  required
                  type="text"
                  value={signupForm.displayName}
                  onChange={(event) =>
                    setSignupForm((current) => ({ ...current, displayName: event.target.value }))
                  }
                />
              </label>
              <label>
                Partner name
                <input
                  required
                  type="text"
                  value={signupForm.partnerName}
                  onChange={(event) =>
                    setSignupForm((current) => ({ ...current, partnerName: event.target.value }))
                  }
                />
              </label>
              <label>
                Partner email
                <input
                  required
                  type="email"
                  value={signupForm.partnerEmail}
                  onChange={(event) =>
                    setSignupForm((current) => ({ ...current, partnerEmail: event.target.value }))
                  }
                />
              </label>
              <label>
                First meeting date
                <input
                  required
                  type="date"
                  value={signupForm.relationshipStartDate}
                  onChange={(event) =>
                    setSignupForm((current) => ({
                      ...current,
                      relationshipStartDate: event.target.value
                    }))
                  }
                />
              </label>
              <label className="checkbox-row">
                <input
                  checked={signupForm.loveMessageOptIn}
                  type="checkbox"
                  onChange={(event) =>
                    setSignupForm((current) => ({
                      ...current,
                      loveMessageOptIn: event.target.checked
                    }))
                  }
                />
                Receive scheduled love-message emails
              </label>
            </>
          ) : null}

          <label>
            Email
            <input
              required
              type="email"
              value={mode === "login" ? loginForm.email : signupForm.email}
              onChange={(event) =>
                mode === "login"
                  ? setLoginForm((current) => ({ ...current, email: event.target.value }))
                  : setSignupForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </label>

          <label>
            Password
            <input
              required
              minLength={mode === "signup" ? 8 : undefined}
              type="password"
              value={mode === "login" ? loginForm.password : signupForm.password}
              onChange={(event) =>
                mode === "login"
                  ? setLoginForm((current) => ({ ...current, password: event.target.value }))
                  : setSignupForm((current) => ({ ...current, password: event.target.value }))
              }
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>
      </section>
    </div>
  );
}
