import React, { useState, useEffect } from "react";
import axios from "axios";

const BUTDSApproval = () => {
  const [tdsList, setTdsList] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must log in to access this page.");
      return;
    }

    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUsername(decodedToken.sub);
      fetchTDSData();
    } catch {
      setError("Invalid token. Please log in again.");
    }
  }, []);

  const fetchTDSData = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await axios.get(
        "http://localhost:8080/api/tds/need-to-approve/bu",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { username }
        }
      );
      setTdsList(response.data.data || []);
    } catch  {
      setError("Error fetching TDS for approval");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && username) {
      fetchTDSData();
    }
  }, [token, username]);

  const handleApproval = async (tdsId, isApproved) => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await axios.put(
        `http://localhost:8080/api/tds/approve/bu/${tdsId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            approved: isApproved,
            username 
          }
        }
      );
      console.log(response.data);
      

      setSuccess(isApproved ? "TDS approved successfully!" : "TDS rejected successfully!");
      setTdsList(tdsList.filter((tds) => tds.tdsId !== tdsId));
    } catch  {
      setError("Error processing the action");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDocument = (documentPath) => {
    if (!documentPath) {
      alert("Invalid document path.");
      return;
    }

    const fileName = documentPath.split(/[\\/]/).pop();
    if (!fileName) {
      alert("Failed to determine the file name.");
      return;
    }

    const downloadUrl = `http://localhost:8080/api/tds/download/${fileName}`;
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("You must log in to view the document.");
      return;
    }

    fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch document");
        return response.blob();
      })
      .then((blob) => {
        const fileUrl = URL.createObjectURL(blob);
        window.open(fileUrl, "_blank");
      })
      .catch((error) => {
        console.error("Error fetching document:", error);
        alert("Failed to view document. Please try again.");
      });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>BU TDS Approval</h2>
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}
      
      {isLoading ? (
        <div>Loading TDS data...</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>TDS Name</th>
              <th style={styles.th}>Document</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Remarks</th>
              <th style={styles.th}>Project</th>
              <th style={styles.th}>Created By</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tdsList.length > 0 ? (
              tdsList.map((tds) => (
                <tr key={tds.tdsId} style={styles.tr}>
                  <td style={styles.td}>{tds.tdsName}</td>
                  <td style={styles.td}>
  {tds.documentPath ? (
    tds.documentPath.split(',').map((path, index) => {
      const fileName = path.split(/[\\/]/).pop(); // gets just the file name
      return (
        <button
          key={index}
          onClick={() => handleViewDocument(path)}
          style={{ ...styles.viewButton, margin: '4px' }}
        >
          {fileName}
        </button>
      );
    })
  ) : (
    <span>No Documents</span>
  )}
</td>

                  <td style={styles.td}>{tds.status}</td>
                  <td style={styles.td}>{tds.remarks}</td>
                  <td style={styles.td}>{tds.project?.projectName || "N/A"}</td>
                  <td style={styles.td}>{tds.project?.stakeholder?.username || "N/A"}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleApproval(tds.tdsId, true)}
                      style={styles.approveButton}
                      disabled={isLoading}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleApproval(tds.tdsId, false)}
                      style={styles.rejectButton}
                      disabled={isLoading}
                    >
                      ❌ Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={styles.noTDS}>
                  No TDS items found for approval.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    fontFamily: '"Roboto", sans-serif',
    maxWidth: "1200px",
    margin: "0 auto"
  },
  heading: {
    fontSize: "1.8rem",
    marginBottom: "1.5rem",
    color: "#333"
  },
  error: {
    color: "#d32f2f",
    padding: "0.8rem",
    marginBottom: "1rem",
    backgroundColor: "#ffebee",
    borderRadius: "4px"
  },
  success: {
    color: "#388e3c",
    padding: "0.8rem",
    marginBottom: "1rem",
    backgroundColor: "#e8f5e9",
    borderRadius: "4px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "1rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  th: {
    padding: "1rem",
    backgroundColor: "#f5f5f5",
    textAlign: "left",
    borderBottom: "1px solid #ddd"
  },
  tr: {
    borderBottom: "1px solid #ddd",
    "&:hover": {
      backgroundColor: "#f9f9f9"
    }
  },
  td: {
    padding: "1rem",
    verticalAlign: "middle"
  },
  viewButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    "&:disabled": {
      backgroundColor: "#90caf9",
      cursor: "not-allowed"
    }
  },
  approveButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "0.5rem",
    "&:disabled": {
      backgroundColor: "#a5d6a7",
      cursor: "not-allowed"
    }
  },
  rejectButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    "&:disabled": {
      backgroundColor: "#ef9a9a",
      cursor: "not-allowed"
    }
  },
  noTDS: {
    padding: "1.5rem",
    textAlign: "center",
    color: "#666",
    fontStyle: "italic"
  }
};

export default BUTDSApproval;