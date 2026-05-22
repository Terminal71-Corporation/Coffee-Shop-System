import { useState } from "react";
import AdminChatList from "./AdminChatList";
import AdminChatBox from "./AdminChatBox";
import "./AdminMessenger.css";

function AdminMessenger() {

  const [selectedUser, setSelectedUser] = useState(null);

  const adminId = 1;

  return (
    <div className="admin-messenger">

      <AdminChatList setSelectedUser={setSelectedUser} />

      <AdminChatBox
        adminId={adminId}
        selectedUser={selectedUser}
      />

    </div>
  );
}

export default AdminMessenger;