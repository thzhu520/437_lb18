import React, { useActionState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

interface ILoginPageProps {
  isRegistering: boolean;
  onAuthSuccess: (token: string) => void;
}

interface IActionState {
  error?: string;
}

export function LoginPage({ isRegistering, onAuthSuccess }: ILoginPageProps) {
  const usernameInputId = React.useId();
  const passwordInputId = React.useId();
  const navigate = useNavigate();

  async function handleAuthAction(
    prevState: IActionState, 
    formData: FormData
  ): Promise<IActionState> {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
      return { error: "Please fill in all fields" };
    }

    try {
      const endpoint = isRegistering ? "/auth/register" : "/auth/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 409) {
          return { error: "Username already exists" };
        } else if (response.status === 401) {
          return { error: "Invalid username or password" };
        } else if (response.status === 400) {
          return { error: "Please provide valid username and password" };
        } else {
          return { error: errorData.message || "Something went wrong" };
        }
      }

      // Both registration and login now return a token
      const data = await response.json();
      const token = data.token;
      
      if (token) {
        onAuthSuccess(token);
        navigate("/");
        return {};
      } else {
        return { error: `${isRegistering ? 'Registration' : 'Login'} succeeded but no token received` };
      }
    } catch (error) {
      console.error("Auth error:", error);
      return { error: "Network error. Please try again." };
    }
  }

  const [state, formAction, isPending] = useActionState(handleAuthAction, {});

  return (
    <>
      <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
      <form action={formAction} className="LoginPage-form">
        <label htmlFor={usernameInputId}>Username</label>
        <input 
          id={usernameInputId} 
          name="username" 
          required 
          disabled={isPending}
        />

        <label htmlFor={passwordInputId}>Password</label>
        <input 
          id={passwordInputId} 
          name="password" 
          type="password" 
          required 
          disabled={isPending}
        />

        <input 
          type="submit" 
          value={isPending ? "Loading..." : "Submit"} 
          disabled={isPending}
        />

        {state.error && (
          <div 
            style={{ color: "red", marginTop: "8px" }}
            aria-live="polite"
          >
            {state.error}
          </div>
        )}
      </form>

      {!isRegistering && (
        <p style={{ marginTop: "16px" }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      )}
    </>
  );
}