function ChatHeader({
    selectedUser,
    selectedGroup,
    onlineUsers,
    isTyping
}) {
    if (selectedGroup) {
        return (
            <header className="chat-window-header">
                <div>
                    <h2>{selectedGroup.name}</h2>
                    <p>
                        {selectedGroup.memberships.length} members
                    </p>
                </div>
            </header>
        );
    }

    const isOnline =
        onlineUsers.includes(
            selectedUser.id
        );

    return (
        <header className="chat-window-header">
            <div>
                <h2>
                    {selectedUser.name}
                </h2>

                <p>
                    {isTyping
                        ? "Typing..."
                        : isOnline
                        ? "Online"
                        : "Offline"}
                </p>
            </div>
        </header>
    );
}

export default ChatHeader;
