import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FullyApprovedTDSPage = () => {
  const [tdsList, setTdsList] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must log in to access this page.');
      return;
    }

    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUsername(decodedToken.sub);
    } catch {
      setError('Invalid token. Please log in again.');
    }
  }, []);

  const fetchApprovedTDS = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.get(
        'http://localhost:8080/api/tds/approved',
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { username }
        }
      );
      setTdsList(response.data.data || []);
    } catch  {
      setError( 'Error fetching Fully Approved TDS data');
      
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && username) {
      fetchApprovedTDS();
    }
  }, [token, username]);

  const handleViewDocument = (documentPath) => {
    if (!documentPath) {
      alert('Invalid document path.');
      return;
    }

    const fileName = documentPath.split(/[\\/]/).pop();
    if (!fileName) {
      alert('Failed to determine the file name.');
      return;
    }

    const downloadUrl = `http://localhost:8080/api/tds/download/${fileName}`;
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('You must log in to view the document.');
      return;
    }

    fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch document');
        return response.blob();
      })
      .then((blob) => {
        const fileUrl = URL.createObjectURL(blob);
        window.open(fileUrl, '_blank');
      })
      .catch((error) => {
        console.error('Error fetching document:', error);
        alert('Failed to view document. Please try again.');
      });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Fully Approved TDS</h2>
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}
      
      {isLoading ? (
        <div>Loading approved TDS data...</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Document</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Approved</th>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Project</th>
              <th style={styles.th}>Current Step</th>
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
                  <td style={styles.td}>{tds.approved ? 'Yes' : 'No'}</td>
                  <td style={styles.td}>{tds.project?.stakeholder?.username || 'N/A'}</td>
                  <td style={styles.td}>{tds.project?.projectName || 'N/A'}</td>
                  <td style={styles.td}>{tds.currentStep}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={styles.noTDS}>
                  No Fully Approved TDS found.
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
    padding: '40px',
    fontFamily: '"Roboto", sans-serif',
    background: 'linear-gradient(to right, #eef2f3, #8e9eab)',
    minHeight: '100vh',
    borderRadius: '10px',
    boxShadow: '0 8px 15px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heading: {
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#333',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
  },
  error: {
    color: 'red',
    marginBottom: '15px',
    fontSize: '16px',
  },
  success: {
    color: 'green',
    marginBottom: '15px',
    fontSize: '16px',
  },
  table: {
    width: '90%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  th: {
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderBottom: '2px solid #ddd',
    fontSize: '16px',
    fontWeight: '600',
    textAlign: 'center',
    color: '#555',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
  },
  tr: {
    borderBottom: '1px solid #ddd',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
  },
  td: {
    padding: '15px',
    fontSize: '14px',
    textAlign: 'center',
    color: '#555',
  },
  viewButton: {
    backgroundColor: '#117285',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    '&:hover:not(:disabled)': {
      backgroundColor: '#0a5171',
      transform: 'scale(1.05)',
    },
    '&:disabled': {
      backgroundColor: '#90caf9',
      cursor: 'not-allowed',
    },
  },
  noTDS: {
    textAlign: 'center',
    padding: '20px',
    fontSize: '16px',
    color: '#999',
    fontStyle: 'italic',
  },
};

export default FullyApprovedTDSPage;