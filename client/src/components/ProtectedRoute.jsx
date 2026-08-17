import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    let hasValidUser = false;

    try {
        hasValidUser = Boolean(JSON.parse(user)?.id);
    } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
    }

    if (
        isLoggedIn !== "true" ||
        !token ||
        !hasValidUser
    ) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
