import axios from "axios";
import {
    useEffect,
    useRef,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";

function Chat() {
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    const savedUser = JSON.parse(
        localStorage.getItem("user")
    );

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");

    const [messages, setMessages] = useState([]);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const token =
                    localStorage.getItem("token");

                const response = await axios.get(
                    "http://localhost:5000/api/auth/users",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setUsers(response.data);

                if (response.data.length > 0) {
                    setSelectedUser(response.data[0]);
                }
            } catch (error) {
                console.error(
                    "Unable to fetch users:",
                    error
                );
            }
        }

        fetchUsers();
    }, []);

    useEffect(() => {
        async function fetchMessages() {
            if (!selectedUser) {
                return;
            }

            try {
                const token =
                    localStorage.getItem("token");

                const response = await axios.get(
                    `http://localhost:5000/api/messages/${selectedUser.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setMessages(response.data);
            } catch (error) {
                console.error(
                    "Unable to fetch messages:",
                    error
                );
            }
        }

        fetchMessages();
    }, [selectedUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages]);

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");

        navigate("/login");
    }

    async function sendMessage(e) {
        e.preventDefault();

        if (
            message.trim() === "" ||
            !selectedUser
        ) {
            return;
        }

        try {
            const token =
                localStorage.getItem("token");

            const response = await axios.post(
                "http://localhost:5000/api/messages",
                {
                    receiverId: selectedUser.id,
                    text: message
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessages([
                ...messages,
                response.data
            ]);

            setMessage("");
        } catch (error) {
            console.error(
                "Unable to send message:",
                error
            );
        }
    }

    if (!selectedUser) {
        return (
            <div className="auth-page">
                <p>No users available to chat</p>
            </div>
        );
    }

    return (
        <div className="chat-page">
            <Sidebar
                users={users}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                search={search}
                setSearch={setSearch}
                savedUser={savedUser}
                logout={logout}
            />

            <section className="chat-window">
                <ChatHeader
                    selectedUser={selectedUser}
                />

                <MessageList
                    messages={messages}
                    currentUser={savedUser}
                    messagesEndRef={messagesEndRef}
                />

                <MessageInput
                    message={message}
                    setMessage={setMessage}
                    sendMessage={sendMessage}
                    selectedUser={selectedUser}
                />
            </section>
        </div>
    );
}

export default Chat;