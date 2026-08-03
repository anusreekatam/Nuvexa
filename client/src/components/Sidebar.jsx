function Sidebar({
    users,
    selectedUser,
    setSelectedUser,
    search,
    setSearch,
    savedUser,
    logout
}) {
    const filteredUsers = users.filter((user) =>
        user.name
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div>
                    <h2>Nuvexa</h2>
                    <p className="logged-user">
                        {savedUser?.name || "User"}
                    </p>
                </div>

                <button onClick={logout}>
                    Logout
                </button>
            </div>

            <input
                className="search"
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="users-list">
                {filteredUsers.map((user) => (
                    <div
                        key={user.name}
                        className={`chat-user ${
                            selectedUser.name === user.name
                                ? "active"
                                : ""
                        }`}
                        onClick={() => setSelectedUser(user)}
                    >
                        <div className="avatar">
                            {user.name[0]}
                        </div>

                        <div>
                            <h3>{user.name}</h3>
                            <p>{user.status}</p>
                        </div>
                    </div>
                ))}

                {filteredUsers.length === 0 && (
                    <p>No users found</p>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;