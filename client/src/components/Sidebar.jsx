import GroupCreator from "./GroupCreator";

function Sidebar({
    users,
    selectedUser,
    selectedGroup,
    groups,
    onSelectUser,
    onSelectGroup,
    onCreateGroup,
    search,
    setSearch,
    savedUser,
    logout,
    onlineUsers,
    isUsersLoading,
    usersError,
    isGroupsLoading,
    groupsError
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
                onChange={(e) =>
                    setSearch(e.target.value)
                }
            />

            <div className="users-list">
                <h3 className="list-title">Direct messages</h3>

                {isUsersLoading && <p>Loading users...</p>}
                {usersError && (
                    <p className="sidebar-error">{usersError}</p>
                )}

                {!isUsersLoading && filteredUsers.map((user) => {
                    const isOnline =
                        onlineUsers.includes(user.id);

                    return (
                        <div
                            key={user.id}
                            className={`chat-user ${
                                selectedUser?.id === user.id
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() => onSelectUser(user)}
                        >
                            <div className="avatar">
                                {user.name[0]}
                            </div>

                            <div>
                                <h3>{user.name}</h3>

                                <p>
                                    {isOnline
                                        ? "Online"
                                        : "Offline"}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {!isUsersLoading && !usersError &&
                    filteredUsers.length === 0 && (
                    <p>No users found</p>
                )}

                <div className="groups-heading">
                    <h3 className="list-title">Groups</h3>
                    <GroupCreator
                        users={users}
                        onCreateGroup={onCreateGroup}
                    />
                </div>

                {isGroupsLoading && <p>Loading groups...</p>}
                {groupsError && (
                    <p className="sidebar-error">{groupsError}</p>
                )}

                {!isGroupsLoading && groups.map((group) => (
                    <div
                        key={group.id}
                        className={`chat-user ${
                            selectedGroup?.id === group.id
                                ? "active"
                                : ""
                        }`}
                        onClick={() => onSelectGroup(group)}
                    >
                        <div className="avatar">#</div>
                        <div>
                            <h3>{group.name}</h3>
                            <p>
                                {group.memberships.length} members
                            </p>
                        </div>
                    </div>
                ))}

                {!isGroupsLoading && !groupsError &&
                    groups.length === 0 && (
                    <p>No groups yet</p>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
