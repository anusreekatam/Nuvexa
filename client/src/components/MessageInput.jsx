function MessageInput({
    message,
    handleMessageChange,
    sendMessage,
    chatName,
    isSending,
    error
}) {
    return (
        <div className="chat-input-area">
            {error && (
                <p className="send-error">{error}</p>
            )}
            <form
                className="chat-input"
                onSubmit={sendMessage}
            >
                <input
                    type="text"
                    placeholder={`Message ${chatName}...`}
                    value={message}
                    disabled={isSending}
                    onChange={(e) =>
                        handleMessageChange(
                            e.target.value
                        )
                    }
                />

                <button
                    type="submit"
                    disabled={
                        isSending || message.trim() === ""
                    }
                >
                    {isSending ? "Sending..." : "Send"}
                </button>
            </form>
        </div>
    );
}

export default MessageInput;
