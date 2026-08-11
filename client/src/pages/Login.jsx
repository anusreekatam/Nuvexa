import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (
            email.trim() === "" ||
            password.trim() === ""
        ) {
            alert("Please fill all fields");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
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

            alert(response.data.message);

            navigate("/chat");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Login failed"
            );
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

                <button type="submit">
                    Login
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