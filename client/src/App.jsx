import {
    BrowserRouter,
    Navigate,
    Routes,
    Route
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";

function Home() {
    const isAuthenticated =
        localStorage.getItem("isLoggedIn") === "true" &&
        Boolean(localStorage.getItem("token"));

    return (
        <Navigate
            to={isAuthenticated ? "/chat" : "/login"}
            replace
        />
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Home />} />

                <Route
                    path="/chat"
                    element={
                        <ProtectedRoute>
                            <Chat />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
