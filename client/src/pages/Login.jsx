import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    function handleSubmit(e) {
    e.preventDefault();

    if (email.trim() === "" || password.trim() === "") {
        alert("Please fill all fields");
        return;
    }

    const userData = localStorage.getItem("registeredUser");

    const savedUser = userData
        ? JSON.parse(userData)
        : null;

    if (!savedUser) {
        alert("No account found. Please register first.");
        return;
    }

    if (
        email === savedUser.email &&
        password === savedUser.password
    ) {
        localStorage.setItem("isLoggedIn", "true");
        alert("Login successful");
        navigate("/chat");
    } else {
        alert("Invalid email or password");
    }
}
    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Welcome Back</h1>
                <p>Login to continue to Nuvexa</p>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Login</button>

                <span>
                    New to Nuvexa?{" "}
                    <Link to="/register">Create account</Link>
                    
                </span>
            </form>
        </div>
    );
}

export default Login;