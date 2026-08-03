import { Link } from "react-router-dom";

function Login() {
    return (
        <div className="auth-page">
            <form className="auth-card">
                <h1>Welcome Back</h1>
                <p>Login to continue to Nuvexa</p>

                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Password" />

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