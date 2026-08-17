import { useState } from "react";

function GroupCreator({ users, onCreateGroup }) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [memberIds, setMemberIds] = useState([]);
    const [error, setError] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    function toggleMember(userId) {
        setMemberIds((currentIds) =>
            currentIds.includes(userId)
                ? currentIds.filter((id) => id !== userId)
                : [...currentIds, userId]
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (isCreating) {
            return;
        }

        setError("");

        if (!name.trim() || memberIds.length === 0) {
            setError("Enter a name and select members");
            return;
        }

        try {
            setIsCreating(true);
            await onCreateGroup(name, memberIds);
            setName("");
            setMemberIds([]);
            setIsOpen(false);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Unable to create group"
            );
        } finally {
            setIsCreating(false);
        }
    }

    if (!isOpen) {
        return (
            <button
                className="create-group-toggle"
                onClick={() => setIsOpen(true)}
            >
                + New group
            </button>
        );
    }

    return (
        <form
            className="group-creator"
            onSubmit={handleSubmit}
        >
            <input
                type="text"
                placeholder="Group name"
                value={name}
                onChange={(event) =>
                    setName(event.target.value)
                }
            />

            <div className="group-member-options">
                {users.map((user) => (
                    <label key={user.id}>
                        <input
                            type="checkbox"
                            checked={memberIds.includes(user.id)}
                            onChange={() => toggleMember(user.id)}
                        />
                        {user.name}
                    </label>
                ))}
            </div>

            {error && <p className="group-error">{error}</p>}

            <div className="group-form-actions">
                <button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create"}
                </button>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isCreating}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default GroupCreator;
