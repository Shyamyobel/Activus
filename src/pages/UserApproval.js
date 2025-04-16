import React, { useState, useEffect } from "react";
import axios from "axios";

const UserApproval = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    // This code will only run on the client side
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    setToken(storedToken);

    if (!storedToken) {
      setError("You must log in to view users for approval.");
      return;
    }

    axios
      .get("http://localhost:8080/api/superadmin/pending-users", {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
      .then((response) => {
        setUsers(response.data || []);
        setError("");
      })
      .catch((err) => {
        setError("Error fetching users for approval.");
        console.error(err);
      });
  }, []);

  const handleApproval = (userId, isApproved) => {
    if (!token) {
      setError("You must log in to perform this action.");
      return;
    }

    axios
      .post(
        "http://localhost:8080/api/superadmin/approve-user",
        { userId, approve: isApproved },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        alert(isApproved ? "User approved!" : "User rejected!");
        setUsers(users.filter((user) => user.id !== userId));
      })
      .catch((err) => {
        setError("Error processing the action.");
        console.error(err);
      });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>User Approval</h2>
      {error && <p style={styles.error}>{error}</p>}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Username</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id} style={styles.tr}>
                <td style={styles.td}>{user.username}</td>
                <td style={styles.td}>{user.emailId}</td>
                <td style={styles.td}>{user.role}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleApproval(user.id, true)}
                    style={styles.approveButton}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleApproval(user.id, false)}
                    style={styles.rejectButton}
                  >
                    ❌ Reject
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={styles.noUsers}>
                No users found for approval.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },
  error: {
    color: "red",
    fontSize: "16px",
    marginBottom: "15px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#f5f5f5",
    padding: "10px",
    textAlign: "left",
  },
  tr: {
    borderBottom: "1px solid #ddd",
  },
  td: {
    padding: "10px",
    textAlign: "left",
  },
  approveButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "5px",
  },
  rejectButton: {
    backgroundColor: "#f44336",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  noUsers: {
    fontStyle: "italic",
    color: "#888",
    textAlign: "center",
  },
};

export default UserApproval;