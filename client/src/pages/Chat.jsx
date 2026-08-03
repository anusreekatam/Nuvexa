import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Chat() {
    const navigate = useNavigate();

    const users = [
        { name: "Ravi", status: "Online" },
        { name: "Anu", status: "Offline" },
        { name: "Kiran", status: "Online" }
    ];

    const [selectedUser, setSelectedUser] = useState(users[0]);
    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem("chatMessages");

    return savedMessages
        ? JSON.parse(savedMessages)
        : {
                Ravi: [
                    { text: "Hey! How are you?", type: "received" },
                    { text: "I am good. What about you?", type: "sent" }
                ],
                Anu: [],
                Kiran: []
            };
    });
    useEffect(() => {
    localStorage.setItem(
        "chatMessages",
        JSON.stringify(messages)
    );
}, [messages]);

    function logout() {
        localStorage.removeItem("isLoggedIn");
        navigate("/login");
    }

    function sendMessage(e) {
        e.preventDefault();

        if (message.trim() === "") {
            return;
        }

        setMessages({
            ...messages,
            [selectedUser.name]: [
                ...messages[selectedUser.name],
                {
                    text: message,
                    type: "sent"
                }
            ]
        });

        setMessage("");
    }

    return (
        <div className="chat-page">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Nuvexa</h2>
                    <button onClick={logout}>Logout</button>
                </div>

                <input
                    className="search"
                    type="text"
                    placeholder="Search users..."
                />

                <div className="users-list">
                    {users.map((user) => (
                        <div
                            key={user.name}
                            className={`chat-user ${
                                selectedUser.name === user.name
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() => setSelectedUser(user)}
                        >
                            <div className="avatar">
                                {user.name[0]}
                            </div>

                            <div>
                                <h3>{user.name}</h3>
                                <p>{user.status}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            <section className="chat-window">
                <header className="chat-window-header">
                    <div>
                        <h2>{selectedUser.name}</h2>
                        <p>{selectedUser.status}</p>
                    </div>
                </header>

                <div className="chat-messages">
                    {messages[selectedUser.name].map((msg, index) => (
                        <div
                            key={index}
                            className={`bubble ${msg.type}`}
                        >
                            {msg.text}
                        </div>
                    ))}
                </div>

                <form
                    className="chat-input"
                    onSubmit={sendMessage}
                >
                    <input
                        type="text"
                        placeholder={`Message ${selectedUser.name}...`}
                        value={message}
                        onChange={(e) =>
                            setMessage(e.target.value)
                        }
                    />

                    <button type="submit">
                        Send
                    </button>
                </form>
            </section>
        </div>
    );
}

export default Chat;