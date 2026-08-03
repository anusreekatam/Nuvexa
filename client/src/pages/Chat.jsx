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
        localStorage.getItem("registeredUser")
    );

    const users = [
        { name: "Ravi", status: "Online" },
        { name: "Anu", status: "Offline" },
        { name: "Kiran", status: "Online" }
    ];

    const [selectedUser, setSelectedUser] = useState(users[0]);
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");

    const [messages, setMessages] = useState(() => {
        const savedMessages =
            localStorage.getItem("chatMessages");

        return savedMessages
            ? JSON.parse(savedMessages)
            : {
                  Ravi: [
                      {
                          text: "Hey! How are you?",
                          type: "received",
                          time: "10:20 AM"
                      },
                      {
                          text: "I am good. What about you?",
                          type: "sent",
                          time: "10:21 AM"
                      }
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, selectedUser]);

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
                    type: "sent",
                    time: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    })
                }
            ]
        });

        setMessage("");
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
                    selectedUser={selectedUser}
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