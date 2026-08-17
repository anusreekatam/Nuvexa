function MessageInput({
    message,
    handleMessageChange,
    sendMessage,
    chatName
}) {
    return (
        <form
            className="chat-input"
            onSubmit={sendMessage}
        >
            <input
                type="text"
                placeholder={`Message ${chatName}...`}
                value={message}
                onChange={(e) =>
                    handleMessageChange(
                        e.target.value
                    )
                }
            />

            <button type="submit">
                Send
            </button>
        </form>
    );
}

export default MessageInput;
