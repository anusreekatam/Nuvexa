function MessageList({
    messages,
    currentUser,
    messagesEndRef
}) {
    return (
        <div className="chat-messages">
            {messages.length === 0 ? (
                <p>No messages yet</p>
            ) : (
                messages.map((msg) => {
                    const type =
                        msg.senderId ===
                        currentUser.id
                            ? "sent"
                            : "received";

                    const time =
                        new Date(
                            msg.createdAt
                        ).toLocaleTimeString(
                            [],
                            {
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        );

                    return (
                        <div
                            key={msg.id}
                            className={`bubble ${type}`}
                        >
                            <span>
                                {msg.text}
                            </span>

                            <small>
                                {time}
                            </small>
                        </div>
                    );
                })
            )}

            <div
                ref={messagesEndRef}
            ></div>
        </div>
    );
}

export default MessageList;