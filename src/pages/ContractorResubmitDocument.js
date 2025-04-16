// import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContractorResubmitDocument = () => {
  const [tdsList, setTdsList] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedFiles, setSelectedFiles] = useState({});
  const [keepExisting, setKeepExisting] = useState({});
  const [documentsToRemove, setDocumentsToRemove] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('You must log in to view rejected documents.');
      return;
    }

    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUsername(decodedToken.username || decodedToken.sub);
    } catch (err) {
      setError('Invalid token. Please log in again.');
    }
  }, [token]);

  const fetchRejectedTDS = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.get(
        'http://localhost:8080/api/tds/rejectedBySME',
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { username }
        }
      );
      setTdsList(response.data.data || []);
      
      // Initialize state for each TDS
      const initialKeepExisting = {};
      const initialSelectedFiles = {};
      response.data.data.forEach(tds => {
        initialKeepExisting[tds.tdsId] = true; // Default to keeping existing
        initialSelectedFiles[tds.tdsId] = null;
      });
      setKeepExisting(initialKeepExisting);
      setSelectedFiles(initialSelectedFiles);
      setDocumentsToRemove({});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch rejected documents');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchRejectedTDS();
    }
  }, [username]);

  const handleFileChange = (event, tdsId) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(prev => ({
        ...prev,
        [tdsId]: files[0]
      }));
    }
  };

  const toggleKeepExisting = (tdsId) => {
    setKeepExisting(prev => ({
      ...prev,
      [tdsId]: !prev[tdsId]
    }));
  };

  const toggleRemoveDocument = (tdsId, docIndex) => {
    setDocumentsToRemove(prev => {
      const current = prev[tdsId] || [];
      const updated = [...current];
      
      if (updated.includes(docIndex)) {
        updated.splice(updated.indexOf(docIndex), 1);
      } else {
        updated.push(docIndex);
      }
      
      return {
        ...prev,
        [tdsId]: updated
      };
    });
  };

  const clearSelection = (tdsId) => {
    setSelectedFiles(prev => ({
      ...prev,
      [tdsId]: null
    }));
    document.getElementById(`file-upload-${tdsId}`).value = '';
  };

  const handleResubmit = async (tdsId) => {
    const tds = tdsList.find(t => t.tdsId === tdsId);
    if (!tds) return;

    const filesToRemove = documentsToRemove[tdsId] || [];
    const isKeepingExisting = keepExisting[tdsId];
    const newFile = selectedFiles[tdsId];

    if (!isKeepingExisting && filesToRemove.length === 0 && !newFile) {
      setError('Please select at least one document to keep or upload a new one');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    if (newFile) {
      formData.append('file', newFile);
    }

    try {
      await axios.post(
        `http://localhost:8080/api/tds/reupload/${tdsId}`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          params: { 
            username,
            keepExisting: isKeepingExisting,
            removeIndices: filesToRemove.join(',')
          }
        }
      );
      
      setSuccess('Document resubmitted successfully!');
      fetchRejectedTDS();
    } catch (err) {
      setError(err.response?.data?.message || 'Error resubmitting document');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDocument = (documentPath) => {
    if (!documentPath) {
      alert('Invalid document path.');
      return;
    }

    const fileName = documentPath.split(/[\\/]/).pop();
    const downloadUrl = `http://localhost:8080/api/tds/download/${fileName}`;

    fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to download document');
        return response.blob();
      })
      .then(blob => {
        const fileUrl = URL.createObjectURL(blob);
        window.open(fileUrl, '_blank');
      })
      .catch(()=> {
        setError('Failed to view document. Please try again.');
      });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Rejected Documents</h2>
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}
      
      {isLoading ? (
        <p>Loading rejected documents...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>TDS Name</th>
              <th style={styles.th}>Documents</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Remarks</th>
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
                      <div style={styles.documentsContainer}>
                        {tds.documentPath.split(',').map((path, index) => {
                          const fileName = path.split(/[\\/]/).pop();
                          const isRemoved = (documentsToRemove[tds.tdsId] || []).includes(index);
                          
                          return (
                            <div key={index} style={styles.documentItem}>
                              <button
                                onClick={() => handleViewDocument(path)}
                                style={{ 
                                  ...styles.viewButton, 
                                  margin: '4px',
                                  textDecoration: isRemoved ? 'line-through' : 'none',
                                  opacity: isRemoved ? 0.6 : 1
                                }}
                                disabled={isLoading || isRemoved}
                              >
                                {fileName}
                              </button>
                              {keepExisting[tds.tdsId] && (
                                <label style={styles.removeCheckbox}>
                                  <input
                                    type="checkbox"
                                    checked={isRemoved}
                                    onChange={() => toggleRemoveDocument(tds.tdsId, index)}
                                    disabled={isLoading}
                                  />
                                  Remove
                                </label>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span>No Documents</span>
                    )}
                  </td>
                  <td style={styles.td}>{tds.status}</td>
                  <td style={styles.td}>{tds.remarks}</td>
                  <td style={styles.td}>
                    <div style={styles.uploadContainer}>
                      <div style={styles.keepExistingContainer}>
                        <label>
                          <input
                            type="checkbox"
                            checked={keepExisting[tds.tdsId]}
                            onChange={() => toggleKeepExisting(tds.tdsId)}
                            disabled={isLoading}
                          />
                          Keep existing documents
                        </label>
                      </div>
                      
                      <div style={styles.fileSelectionContainer}>
                        <input
                          type="file"
                          onChange={(e) => handleFileChange(e, tds.tdsId)}
                          style={styles.fileInput}
                          id={`file-upload-${tds.tdsId}`}
                          disabled={isLoading}
                        />
                        <label 
                          htmlFor={`file-upload-${tds.tdsId}`}
                          style={styles.fileInputLabel}
                        >
                          Choose File
                        </label>
                        
                        {selectedFiles[tds.tdsId] && (
                          <>
                            <span style={styles.fileName}>
                              {selectedFiles[tds.tdsId].name}
                            </span>
                            <button
                              onClick={() => clearSelection(tds.tdsId)}
                              style={styles.cancelButton}
                              disabled={isLoading}
                            >
                              ×
                            </button>
                          </>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleResubmit(tds.tdsId)}
                        style={styles.resubmitButton}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Resubmit'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={styles.noTDS}>
                  No rejected documents found.
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
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#333',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
  },
  error: {
    color: 'red',
    marginBottom: '15px',
    fontSize: '16px',
    textAlign: 'center',
  },
  success: {
    color: 'green',
    marginBottom: '15px',
    fontSize: '16px',
    textAlign: 'center',
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
  documentsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  documentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  viewButton: {
    backgroundColor: '#117285',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#0a5171',
      transform: 'scale(1.05)',
    },
    '&:disabled': {
      backgroundColor: '#cccccc',
      cursor: 'not-allowed',
    },
  },
  removeCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#666',
  },
  uploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  keepExistingContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  fileSelectionContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  fileInput: {
    display: 'none',
  },
  fileInputLabel: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#45a049',
      transform: 'scale(1.05)',
    },
  },
  fileName: {
    fontSize: '12px',
    maxWidth: '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#cc0000',
    },
  },
  resubmitButton: {
    backgroundColor: '#FFA500',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#CC8400',
      transform: 'scale(1.05)',
    },
    '&:disabled': {
      backgroundColor: '#FFD699',
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

export default ContractorResubmitDocument;