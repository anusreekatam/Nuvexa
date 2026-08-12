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

import socket from "../socket";

function Chat() {
    const navigate = useNavigate();

    const messagesEndRef = useRef(null);

    const savedUser = JSON.parse(
        localStorage.getItem("user")
    );

    const [users, setUsers] =
        useState([]);

    const [selectedUser, setSelectedUser] =
        useState(null);

    const [message, setMessage] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [messages, setMessages] =
        useState([]);

    const [onlineUsers, setOnlineUsers] =
        useState([]);

    // Fetch real users from database
    useEffect(() => {
        async function fetchUsers() {
            try {
                const token =
                    localStorage.getItem("token");

                const response =
                    await axios.get(
                        "http://localhost:5000/api/auth/users",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                setUsers(response.data);

                if (response.data.length > 0) {
                    setSelectedUser(
                        response.data[0]
                    );
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

    // Join / rejoin socket room
    useEffect(() => {
        function joinUser() {
            if (savedUser?.id) {
                socket.emit(
                    "join_user",
                    savedUser.id
                );
            }
        }

        if (socket.connected) {
            joinUser();
        }

        socket.on(
            "connect",
            joinUser
        );

        return () => {
            socket.off(
                "connect",
                joinUser
            );
        };
    }, [savedUser?.id]);

    // Receive online users
    useEffect(() => {
        function handleOnlineUsers(userIds) {
            setOnlineUsers(userIds);
        }

        socket.on(
            "online_users",
            handleOnlineUsers
        );

        return () => {
            socket.off(
                "online_users",
                handleOnlineUsers
            );
        };
    }, []);

    // Fetch selected user's messages
    useEffect(() => {
        async function fetchMessages() {
            if (!selectedUser) {
                return;
            }

            try {
                const token =
                    localStorage.getItem("token");

                const response =
                    await axios.get(
                        `http://localhost:5000/api/messages/${selectedUser.id}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
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

    // Receive real-time messages
    useEffect(() => {
        function handleReceiveMessage(
            newMessage
        ) {
            if (
                selectedUser &&
                newMessage.senderId ===
                    selectedUser.id
            ) {
                setMessages(
                    (prevMessages) => [
                        ...prevMessages,
                        newMessage
                    ]
                );
            }
        }

        socket.on(
            "receive_message",
            handleReceiveMessage
        );

        return () => {
            socket.off(
                "receive_message",
                handleReceiveMessage
            );
        };
    }, [selectedUser]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current
            ?.scrollIntoView({
                behavior: "smooth"
            });
    }, [messages]);

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem(
            "isLoggedIn"
        );

        socket.disconnect();

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

            const response =
                await axios.post(
                    "http://localhost:5000/api/messages",
                    {
                        receiverId:
                            selectedUser.id,
                        text: message
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setMessages(
                (prevMessages) => [
                    ...prevMessages,
                    response.data
                ]
            );

            socket.emit(
                "send_message",
                response.data
            );

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
                <p>
                    No users available to chat
                </p>
            </div>
        );
    }

    return (
        <div className="chat-page">
            <Sidebar
                users={users}
                selectedUser={
                    selectedUser
                }
                setSelectedUser={
                    setSelectedUser
                }
                search={search}
                setSearch={setSearch}
                savedUser={savedUser}
                logout={logout}
                onlineUsers={
                    onlineUsers
                }
            />

            <section className="chat-window">
                <ChatHeader
                    selectedUser={
                        selectedUser
                    }
                    onlineUsers={
                        onlineUsers
                    }
                />

                <MessageList
                    messages={messages}
                    currentUser={
                        savedUser
                    }
                    messagesEndRef={
                        messagesEndRef
                    }
                />

                <MessageInput
                    message={message}
                    setMessage={setMessage}
                    sendMessage={
                        sendMessage
                    }
                    selectedUser={
                        selectedUser
                    }
                />
            </section>
        </div>
    );
}

export default Chat;