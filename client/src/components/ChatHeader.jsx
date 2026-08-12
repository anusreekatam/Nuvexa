function ChatHeader({
    selectedUser,
    onlineUsers
}) {
    const isOnline =
        onlineUsers.includes(selectedUser.id);

    return (
        <header className="chat-window-header">
            <div>
                <h2>{selectedUser.name}</h2>

                <p>
                    {isOnline
                        ? "Online"
                        : "Offline"}
                </p>
            </div>
        </header>
    );
}

export default ChatHeader;