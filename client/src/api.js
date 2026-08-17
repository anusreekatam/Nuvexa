import axios from "axios";

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api"
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest =
            error.config?.url === "/auth/login";

        if (
            error.response?.status === 401 &&
            !isLoginRequest
        ) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("isLoggedIn");

            if (window.location.pathname !== "/login") {
                window.location.replace("/login");
            }
        }

        return Promise.reject(error);
    }
);

export default api;
