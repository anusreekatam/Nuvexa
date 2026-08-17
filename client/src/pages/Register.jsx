import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Register() {
    const [name, setName] = useState("");
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
            name.trim() === "" ||
            email.trim() === "" ||
            password.trim() === ""
        ) {
            setError("Please fill all fields");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post(
                "/auth/register",
                {
                    name,
                    email,
                    password
                }
            );

            navigate("/login");
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
                <h1>Create Account</h1>
                <p>Join Nuvexa and start chatting</p>

                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                />

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
                    {isSubmitting ? "Creating..." : "Register"}
                </button>

                <span>
                    Already have an account?{" "}
                    <Link to="/login">
                        Login
                    </Link>
                </span>
            </form>
        </div>
    );
}

export default Register;
