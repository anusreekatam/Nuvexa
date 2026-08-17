import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (isSubmitting) {
            return;
        }

        setError("");

        if (
            email.trim() === "" ||
            password.trim() === ""
        ) {
            setError("Please fill all fields");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await api.post(
                "/auth/login",
                {
                    email,
                    password
                }
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            localStorage.setItem(
                "isLoggedIn",
                "true"
            );

            navigate("/chat");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to reach the server. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="auth-page">
            <form
                className="auth-card"
                onSubmit={handleSubmit}
            >
                <h1>Welcome Back</h1>
                <p>Login to continue to Nuvexa</p>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                {error && (
                    <p className="form-message error-message">
                        {error}
                    </p>
                )}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                </button>

                <span>
                    New to Nuvexa?{" "}
                    <Link to="/register">
                        Create account
                    </Link>
                </span>
            </form>
        </div>
    );
}

export default Login;
