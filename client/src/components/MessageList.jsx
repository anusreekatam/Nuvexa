function MessageList({
    messages,
    currentUser,
    messagesEndRef,
    isGroup
}) {
    return (
        <div className="chat-messages">
            {messages.length === 0 ? (
                <p>No messages yet</p>
            ) : (
                messages.map((msg) => {
                    const type =
                        Number(msg.senderId) ===
                        Number(currentUser.id)
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
                            {isGroup && type === "received" && (
                                <strong className="message-sender">
                                    {msg.sender?.name}
                                </strong>
                            )}

                            <span>
                                {msg.text}
                            </span>

                            <small>
                                {time}
                                {!isGroup && type === "sent" && (
                                    <>
                                        {" · "}
                                        {msg.isRead
                                            ? "Seen"
                                            : "Sent"}
                                    </>
                                )}
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
