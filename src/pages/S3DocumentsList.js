import React, { useState, useEffect } from 'react';
import axios from 'axios';

const S3DocumentsList = () => {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [stakeholderUsername, setStakeholderUsername] = useState('');
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
      
      // Automatically determine stakeholder if user is contractor
      if (decodedToken.role === 'Contractor') {
        fetchStakeholderUsername(decodedToken.sub);
      } else if (decodedToken.role === 'Stakeholder') {
        setStakeholderUsername(decodedToken.sub);
      }
    } catch {
      setError('Invalid token. Please log in again.');
    }
  }, []);

  const fetchStakeholderUsername = async (contractorUsername) => {
    try {
      const response = await axios.get(
        'https://activus-server-production.up.railway.app/api/projects/contractor/' + contractorUsername,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.data && response.data.data.length > 0) {
        setStakeholderUsername(response.data.data[0].stakeholder.username);
      }
    } catch (err) {
      console.error('Failed to fetch stakeholder:', err);
    }
  };

  const fetchS3Documents = async () => {
    if (!stakeholderUsername || !username) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.get(
        'https://activus-server-production.up.railway.app/api/tds/s3Documents',
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            stakeholderUsername,
            contractorUsername: username 
          }
        }
      );
      setDocuments(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch S3 documents');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && username && stakeholderUsername) {
      fetchS3Documents();
    }
  }, [token, username, stakeholderUsername]);

  const handleViewDocument = (s3Key) => {
    if (!s3Key) {
      alert('Invalid document path.');
      return;
    }

    const downloadUrl = `https://activus-server-production.up.railway.app/api/tds/downloadFromS3?s3Key=${encodeURIComponent(s3Key)}`;
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

  const handleRefresh = () => {
    fetchS3Documents();
    setSuccess('Document list refreshed');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>S3 Documents Repository</h2>
      <div style={styles.subHeader}>
        Viewing documents for: {stakeholderUsername || 'Not specified'} (Stakeholder) / {username} (User)
      </div>
      
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}
      
      {isLoading ? (
        <div style={styles.loading}>Loading documents...</div>
      ) : (
        <>
          <button 
            onClick={handleRefresh}
            style={styles.refreshButton}
            disabled={isLoading}
          >
            ↻ Refresh List
          </button>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Filename</th>
                <th style={styles.th}>Size</th>
                <th style={styles.th}>Last Modified</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <tr key={index} style={styles.tr}>
                    <td style={styles.td}>{doc.filename}</td>
                    <td style={styles.td}>{(doc.size / 1024).toFixed(2)} KB</td>
                    <td style={styles.td}>{new Date(doc.lastModified).toLocaleString()}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleViewDocument(doc.s3Key)}
                        style={styles.viewButton}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={styles.noDocuments}>
                    No documents found in S3 repository
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

// Reusing and extending the styles from ContractorFullyApprovedTDS
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
    marginBottom: '10px',
    color: '#333',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
  },
  subHeader: {
    marginBottom: '20px',
    color: '#555',
    fontSize: '14px',
    fontStyle: 'italic'
  },
  error: {
    color: 'red',
    marginBottom: '15px',
    fontSize: '16px',
    padding: '10px',
    backgroundColor: '#ffebee',
    borderRadius: '4px'
  },
  success: {
    color: 'green',
    marginBottom: '15px',
    fontSize: '16px',
    padding: '10px',
    backgroundColor: '#e8f5e9',
    borderRadius: '4px'
  },
  loading: {
    margin: '20px 0',
    fontSize: '16px',
    color: '#555'
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    marginBottom: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    alignSelf: 'flex-end',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#1976D2',
      transform: 'scale(1.02)'
    },
    '&:disabled': {
      backgroundColor: '#90CAF9',
      cursor: 'not-allowed'
    }
  },
  table: {
    width: '90%',
    borderCollapse: 'collapse',
    marginTop: '10px',
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
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#0a5171',
      transform: 'scale(1.05)',
    }
  },
  noDocuments: {
    textAlign: 'center',
    padding: '20px',
    fontSize: '16px',
    color: '#999',
    fontStyle: 'italic',
  },
};

export default S3DocumentsList;