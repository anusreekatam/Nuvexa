import { Link } from "react-router-dom";

function Register() {
    return (
        <div className="auth-page">
            <form className="auth-card">
                <h1>Create Account</h1>
                <p>Join Nuvexa and start chatting</p>

                <input type="text" placeholder="Full Name" />
                <input type="email" placeholder="Email" />
                <input type="password" placeholder="Password" />

                <button type="submit">Register</button>

                <span>
                    Already have an account?{" "}
                    <Link to="/login">Login</Link>
                </span>
            </form>
        </div>
    );
}

export default Register;