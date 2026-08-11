import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (
            name.trim() === "" ||
            email.trim() === "" ||
            password.trim() === ""
        ) {
            alert("Please fill all fields");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/register",
                {
                    name,
                    email,
                    password
                }
            );

            alert(response.data.message);
            navigate("/login");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Registration failed"
            );
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

                <button type="submit">
                    Register
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