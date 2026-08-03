function MessageList({
    messages,
    selectedUser,
    messagesEndRef
}) {
    const currentMessages =
        messages[selectedUser.name] || [];

    return (
        <div className="chat-messages">
            {currentMessages.length === 0 ? (
                <p>No messages yet</p>
            ) : (
                currentMessages.map((msg, index) => (
                    <div
                        key={index}
                        className={`bubble ${msg.type}`}
                    >
                        <span>{msg.text}</span>
                        <small>{msg.time || "Now"}</small>
                    </div>
                ))
            )}

            <div ref={messagesEndRef}></div>
        </div>
    );
}

export default MessageList;