function MessageInput({
    message,
    setMessage,
    sendMessage,
    selectedUser
}) {
    return (
        <form
            className="chat-input"
            onSubmit={sendMessage}
        >
            <input
                type="text"
                placeholder={`Message ${selectedUser.name}...`}
                value={message}
                onChange={(e) =>
                    setMessage(e.target.value)
                }
            />

            <button type="submit">
                Send
            </button>
        </form>
    );
}

export default MessageInput;