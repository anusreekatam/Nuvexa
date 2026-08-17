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
import api from "../api";

function mergeMessages(history, currentMessages) {
    const messagesById = new Map();

    [...history, ...currentMessages].forEach((currentMessage) => {
        messagesById.set(currentMessage.id, currentMessage);
    });

    return Array.from(messagesById.values()).sort(
        (firstMessage, secondMessage) =>
            new Date(firstMessage.createdAt) -
            new Date(secondMessage.createdAt)
    );
}

function Chat() {
    const navigate = useNavigate();

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const typingIndicatorTimeoutRef = useRef(null);
    const typingIndicatorSenderRef = useRef(null);

    const savedUser = JSON.parse(
        localStorage.getItem("user")
    );

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");

    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isUsersLoading, setIsUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState("");
    const [isGroupsLoading, setIsGroupsLoading] = useState(true);
    const [groupsError, setGroupsError] = useState("");
    const [isConversationLoading, setIsConversationLoading] =
        useState(false);
    const [conversationError, setConversationError] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState("");
    const [socketStatus, setSocketStatus] = useState(
        socket.connected ? "connected" : "connecting"
    );

    const [typingUserId, setTypingUserId] =
        useState(null);

    async function markMessagesRead(senderId) {
        try {
            const token =
                localStorage.getItem("token");

            const response = await api.patch(
                `/messages/read/${senderId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const readMessageIds = new Set(
                response.data.messageIds
            );

            if (readMessageIds.size === 0) {
                return;
            }

            setMessages((currentMessages) =>
                currentMessages.map((currentMessage) =>
                    readMessageIds.has(currentMessage.id)
                        ? {
                              ...currentMessage,
                              isRead: true,
                              readAt: response.data.readAt
                          }
                        : currentMessage
                )
            );
        } catch (error) {
            console.error(
                "Unable to mark messages as read:",
                error
            );
        }
    }

    useEffect(() => {
        async function fetchUsers() {
            try {
                setUsersError("");
                const token =
                    localStorage.getItem("token");

                const response = await api.get(
                    "/auth/users",
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
                setUsersError(
                    error.response?.data?.message ||
                        "Unable to load users"
                );
            } finally {
                setIsUsersLoading(false);
            }
        }

        fetchUsers();
    }, []);

    useEffect(() => {
        async function fetchGroups() {
            try {
                setGroupsError("");
                const token =
                    localStorage.getItem("token");
                const response = await api.get(
                    "/groups",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setGroups(response.data);
            } catch (error) {
                console.error(
                    "Unable to fetch groups:",
                    error
                );
                setGroupsError(
                    error.response?.data?.message ||
                        "Unable to load groups"
                );
            } finally {
                setIsGroupsLoading(false);
            }
        }

        fetchGroups();
    }, []);

    useEffect(() => {
        function joinUser() {
            if (savedUser?.id) {
                socket.emit(
                    "join_user",
                    {
                        userId: savedUser.id,
                        token: localStorage.getItem("token")
                    }
                );
            }
        }

        if (socket.connected) {
            joinUser();
        }

        socket.on("connect", joinUser);

        return () => {
            socket.off("connect", joinUser);
        };
    }, [savedUser?.id]);

    useEffect(() => {
        function handleConnect() {
            setSocketStatus("connected");
        }

        function handleDisconnect() {
            setSocketStatus("disconnected");
        }

        function handleReconnectAttempt() {
            setSocketStatus("reconnecting");
        }

        function handleAuthenticationError() {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("isLoggedIn");
            navigate("/login", { replace: true });
        }

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on(
            "authentication_error",
            handleAuthenticationError
        );
        socket.io.on(
            "reconnect_attempt",
            handleReconnectAttempt
        );

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off(
                "authentication_error",
                handleAuthenticationError
            );
            socket.io.off(
                "reconnect_attempt",
                handleReconnectAttempt
            );
        };
    }, [navigate]);

    useEffect(() => {
        function joinGroups() {
            groups.forEach((group) => {
                socket.emit("join_group", group.id);
            });
        }

        if (socket.connected) {
            joinGroups();
        }

        socket.on("connect", joinGroups);

        return () => {
            socket.off("connect", joinGroups);
        };
    }, [groups]);

    useEffect(() => {
        function handleGroupCreated(group) {
            setGroups((currentGroups) =>
                currentGroups.some(
                    (currentGroup) =>
                        currentGroup.id === group.id
                )
                    ? currentGroups
                    : [group, ...currentGroups]
            );
            socket.emit("join_group", group.id);
        }

        socket.on("group_created", handleGroupCreated);

        return () => {
            socket.off(
                "group_created",
                handleGroupCreated
            );
        };
    }, []);

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

    useEffect(() => {
        const requestController = new AbortController();

        async function fetchMessages() {
            if (!selectedUser) {
                return;
            }

            try {
                setIsConversationLoading(true);
                setConversationError("");
                const token =
                    localStorage.getItem("token");

                const response = await api.get(
                    `/messages/${selectedUser.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        signal: requestController.signal
                    }
                );

                setMessages((currentMessages) =>
                    mergeMessages(
                        response.data,
                        currentMessages
                    )
                );
                await markMessagesRead(
                    selectedUser.id
                );
            } catch (error) {
                if (error.code === "ERR_CANCELED") {
                    return;
                }

                console.error(
                    "Unable to fetch messages:",
                    error
                );
                setConversationError(
                    error.response?.data?.message ||
                        "Unable to load this conversation"
                );
            } finally {
                if (!requestController.signal.aborted) {
                    setIsConversationLoading(false);
                }
            }
        }

        fetchMessages();

        return () => {
            requestController.abort();
        };
    }, [selectedUser]);

    useEffect(() => {
        const requestController = new AbortController();

        async function fetchGroupMessages() {
            if (!selectedGroup) {
                return;
            }

            try {
                setIsConversationLoading(true);
                setConversationError("");
                const token =
                    localStorage.getItem("token");
                const response = await api.get(
                    `/groups/${selectedGroup.id}/messages`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        signal: requestController.signal
                    }
                );

                setMessages((currentMessages) =>
                    mergeMessages(
                        response.data,
                        currentMessages
                    )
                );
            } catch (error) {
                if (error.code === "ERR_CANCELED") {
                    return;
                }

                console.error(
                    "Unable to fetch group messages:",
                    error
                );
                setConversationError(
                    error.response?.data?.message ||
                        "Unable to load this group"
                );
            } finally {
                if (!requestController.signal.aborted) {
                    setIsConversationLoading(false);
                }
            }
        }

        fetchGroupMessages();

        return () => {
            requestController.abort();
        };
    }, [selectedGroup]);

    useEffect(() => {
        async function handleReceiveMessage(
            newMessage
        ) {
            if (
                selectedUser &&
                Number(newMessage.senderId) ===
                    Number(selectedUser.id)
            ) {
                setMessages(
                    (prevMessages) =>
                        prevMessages.some(
                            (currentMessage) =>
                                currentMessage.id === newMessage.id
                        )
                            ? prevMessages
                            : [...prevMessages, newMessage]
                );

                await markMessagesRead(
                    selectedUser.id
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

    useEffect(() => {
        function handleReceiveGroupMessage(newMessage) {
            if (
                Number(newMessage.groupId) ===
                Number(selectedGroup?.id)
            ) {
                setMessages((currentMessages) =>
                    currentMessages.some(
                        (currentMessage) =>
                            currentMessage.id === newMessage.id
                    )
                        ? currentMessages
                        : [...currentMessages, newMessage]
                );
            }
        }

        socket.on(
            "receive_group_message",
            handleReceiveGroupMessage
        );

        return () => {
            socket.off(
                "receive_group_message",
                handleReceiveGroupMessage
            );
        };
    }, [selectedGroup]);

    useEffect(() => {
        function handleMessagesRead({
            messageIds,
            readerId,
            readAt
        }) {
            if (
                Number(readerId) !==
                Number(selectedUser?.id)
            ) {
                return;
            }

            const readMessageIds = new Set(
                messageIds
            );

            setMessages((currentMessages) =>
                currentMessages.map((currentMessage) =>
                    readMessageIds.has(currentMessage.id)
                        ? {
                              ...currentMessage,
                              isRead: true,
                              readAt
                          }
                        : currentMessage
                )
            );
        }

        socket.on(
            "messages_read",
            handleMessagesRead
        );

        return () => {
            socket.off(
                "messages_read",
                handleMessagesRead
            );
        };
    }, [selectedUser]);

    useEffect(() => {
        function handleTyping({
            senderId
        }) {
            setTypingUserId(
                Number(senderId)
            );

            typingIndicatorSenderRef.current =
                Number(senderId);

            clearTimeout(
                typingIndicatorTimeoutRef.current
            );

            typingIndicatorTimeoutRef.current =
                setTimeout(() => {
                    setTypingUserId(
                        (currentId) =>
                            Number(currentId) ===
                            Number(senderId)
                                ? null
                                : currentId
                    );

                    typingIndicatorSenderRef.current =
                        null;
                }, 2000);
        }

        function handleStopTyping({
            senderId
        }) {
            setTypingUserId(
                (currentId) =>
                    Number(currentId) ===
                    Number(senderId)
                        ? null
                        : currentId
            );

            if (
                Number(
                    typingIndicatorSenderRef.current
                ) === Number(senderId)
            ) {
                clearTimeout(
                    typingIndicatorTimeoutRef.current
                );

                typingIndicatorSenderRef.current =
                    null;
            }
        }

        socket.on(
            "user_typing",
            handleTyping
        );

        socket.on(
            "user_stop_typing",
            handleStopTyping
        );

        return () => {
            socket.off(
                "user_typing",
                handleTyping
            );

            socket.off(
                "user_stop_typing",
                handleStopTyping
            );

            clearTimeout(
                typingIndicatorTimeoutRef.current
            );

            typingIndicatorSenderRef.current =
                null;
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current
            ?.scrollIntoView({
                behavior: "smooth"
            });
    }, [messages]);

    function selectUser(user) {
        setSelectedGroup(null);
        setSelectedUser(user);
        setMessages([]);
        setIsConversationLoading(true);
        setMessage("");
        setSendError("");
    }

    function selectGroup(group) {
        if (selectedUser && savedUser) {
            socket.emit("stop_typing", {
                senderId: savedUser.id,
                receiverId: selectedUser.id
            });
        }

        clearTimeout(typingTimeoutRef.current);
        setSelectedUser(null);
        setSelectedGroup(group);
        setMessages([]);
        setIsConversationLoading(true);
        setMessage("");
        setSendError("");
    }

    async function createGroup(name, memberIds) {
        const token = localStorage.getItem("token");
        const response = await api.post(
            "/groups",
            {
                name,
                memberIds
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        setGroups((currentGroups) => [
            response.data,
            ...currentGroups
        ]);
        socket.emit("join_group", response.data.id);
        selectGroup(response.data);
    }

    function handleMessageChange(value) {
        setMessage(value);

        if (selectedGroup) {
            return;
        }

        if (
            !selectedUser ||
            !savedUser
        ) {
            return;
        }

        clearTimeout(
            typingTimeoutRef.current
        );

        if (value.trim() === "") {
            socket.emit(
                "stop_typing",
                {
                    senderId:
                        savedUser.id,
                    receiverId:
                        selectedUser.id
                }
            );

            return;
        }

        socket.emit(
            "typing",
            {
                senderId:
                    savedUser.id,
                receiverId:
                    selectedUser.id
            }
        );

        typingTimeoutRef.current =
            setTimeout(() => {
                socket.emit(
                    "stop_typing",
                    {
                        senderId:
                            savedUser.id,
                        receiverId:
                            selectedUser.id
                    }
                );
            }, 1200);
    }

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
            isSending ||
            message.trim() === "" ||
            (!selectedUser && !selectedGroup)
        ) {
            return;
        }

        try {
            setIsSending(true);
            setSendError("");
            const token =
                localStorage.getItem("token");

            if (selectedGroup) {
                const response = await api.post(
                    `/groups/${selectedGroup.id}/messages`,
                    {
                        text: message
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                setMessages((currentMessages) => [
                    ...currentMessages,
                    response.data
                ]);
                socket.emit(
                    "send_group_message",
                    response.data.id
                );
                setMessage("");
                return;
            }

            const response = await api.post(
                "/messages",
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
                response.data.id
            );

            socket.emit(
                "stop_typing",
                {
                    senderId:
                        savedUser.id,
                    receiverId:
                        selectedUser.id
                }
            );

            clearTimeout(
                typingTimeoutRef.current
            );

            setMessage("");
        } catch (error) {
            console.error(
                "Unable to send message:",
                error
            );
            setSendError(
                error.response?.data?.message ||
                    "Unable to send message"
            );
        } finally {
            setIsSending(false);
        }
    }

    const isSelectedUserTyping =
        Number(typingUserId) ===
        Number(selectedUser?.id);

    return (
        <div className="chat-page">
            <Sidebar
                users={users}
                selectedUser={selectedUser}
                selectedGroup={selectedGroup}
                groups={groups}
                onSelectUser={selectUser}
                onSelectGroup={selectGroup}
                onCreateGroup={createGroup}
                search={search}
                setSearch={setSearch}
                savedUser={savedUser}
                logout={logout}
                onlineUsers={onlineUsers}
                isUsersLoading={isUsersLoading}
                usersError={usersError}
                isGroupsLoading={isGroupsLoading}
                groupsError={groupsError}
            />

            <section className="chat-window">
                {socketStatus !== "connected" && (
                    <div className="socket-status">
                        {socketStatus === "reconnecting"
                            ? "Reconnecting to chat..."
                            : socketStatus === "connecting"
                            ? "Connecting to chat..."
                            : "Chat connection lost. Reconnecting..."}
                    </div>
                )}

                {selectedUser || selectedGroup ? (
                    <>
                        <ChatHeader
                            selectedUser={selectedUser}
                            selectedGroup={selectedGroup}
                            onlineUsers={onlineUsers}
                            isTyping={isSelectedUserTyping}
                        />

                        {isConversationLoading ? (
                            <div className="conversation-state">
                                Loading messages...
                            </div>
                        ) : conversationError ? (
                            <div className="conversation-state error-message">
                                {conversationError}
                            </div>
                        ) : (
                            <MessageList
                                messages={messages}
                                currentUser={savedUser}
                                messagesEndRef={messagesEndRef}
                                isGroup={Boolean(selectedGroup)}
                            />
                        )}

                        <MessageInput
                            message={message}
                            handleMessageChange={handleMessageChange}
                            sendMessage={sendMessage}
                            chatName={
                                selectedGroup?.name ||
                                selectedUser?.name
                            }
                            isSending={isSending}
                            error={sendError}
                        />
                    </>
                ) : (
                    <div className="empty-chat-state">
                        {isUsersLoading || isGroupsLoading
                            ? "Loading conversations..."
                            : "No conversations available"}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Chat;
