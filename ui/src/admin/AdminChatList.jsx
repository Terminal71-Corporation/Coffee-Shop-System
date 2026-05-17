import { useEffect, useState } from "react";

function AdminChatList({ setSelectedUser }) {

  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/messages/admin/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []); // ← safe guard
    } catch (err) {
      console.log("AdminChatList error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="admin-chat-list">
      <h3>Inbox</h3>
      {users.length === 0 && (
        <p style={{ padding: "12px 20px", color: "#aaa", fontSize: "13px" }}>
          No conversations yet
        </p>
      )}
      {users.map((user) => (
        <div
          key={user.user_id}
          className="chat-user"
          onClick={() => setSelectedUser(user)}
        >
          <p>{user.name}</p>
          <small>{user.email}</small>
        </div>
      ))}
    </div>
  );
}

export default AdminChatList;