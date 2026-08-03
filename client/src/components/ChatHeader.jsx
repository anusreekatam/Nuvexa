function ChatHeader({ selectedUser }) {
    return (
        <header className="chat-window-header">
            <div>
                <h2>{selectedUser.name}</h2>
                <p>{selectedUser.status}</p>
            </div>
        </header>
    );
}

export default ChatHeader;