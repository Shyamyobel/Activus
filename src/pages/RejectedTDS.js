import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RejectedTDS = () => {
  const [rejectedTDSList, setRejectedTDSList] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [recheckData, setRecheckData] = useState({
    tdsId: '',
    remarks: '',
    existingFiles: [],
    filesToRemove: [],
    newFiles: []
  });
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

  const fetchRejectedTDS = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.get(
        'http://localhost:8080/api/tds/need-to-recheck',
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { username }
        }
      );
      setRejectedTDSList(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch rejected TDS');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && username) {
      fetchRejectedTDS();
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

  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files);
    setRecheckData(prev => ({
      ...prev,
      newFiles: [...prev.newFiles, ...files]
    }));
  };

  const toggleFileToRemove = (filePath) => {
    setRecheckData(prev => {
      const newFilesToRemove = prev.filesToRemove.includes(filePath)
        ? prev.filesToRemove.filter(f => f !== filePath)
        : [...prev.filesToRemove, filePath];
      
      return {
        ...prev,
        filesToRemove: newFilesToRemove
      };
    });
  };

  const removeNewFile = (index) => {
    setRecheckData(prev => {
      const newFiles = [...prev.newFiles];
      newFiles.splice(index, 1);
      return { ...prev, newFiles };
    });
  };

  const prepareRecheckData = (tds) => {
    // Handle both single path and comma-separated paths
    const existingFiles = tds.documentPath 
      ? (tds.documentPath.includes(',') ? tds.documentPath.split(',') : [tds.documentPath])
      : [];
      
    setRecheckData({
      tdsId: tds.tdsId,
      remarks: '',
      existingFiles,
      filesToRemove: [], // Start with empty array for files to remove
      newFiles: []
    });
  };

  const handleRecheck = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Get the files that will be kept (existing files not marked for removal)
    const keptExistingFiles = recheckData.existingFiles.filter(
      file => !recheckData.filesToRemove.includes(file)
    );
    
    if (keptExistingFiles.length === 0 && recheckData.newFiles.length === 0) {
      setError('You must keep at least one existing file or upload new files.');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    
    // Add new files
    recheckData.newFiles.forEach(file => {
      formData.append('files', file);
    });

    // Add files to remove and remarks
    formData.append('remarks', recheckData.remarks);
    formData.append('username', username);
    formData.append('filesToRemove', recheckData.filesToRemove.join(','));
    formData.append('filesToKeep', keptExistingFiles.join(',')); // Explicitly send files to keep

    try {
      const response = await axios.put(
        `http://localhost:8080/api/tds/recheck/${recheckData.tdsId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      console.log('Recheck response:', response.data); // Debugging
      
      setSuccess('TDS rechecked successfully!');
      setRejectedTDSList(rejectedTDSList.filter(tds => tds.tdsId !== parseInt(recheckData.tdsId)));
      setRecheckData({
        tdsId: '',
        remarks: '',
        existingFiles: [],
        filesToRemove: [],
        newFiles: []
      });
    } catch (err) {
      console.error('Recheck error:', err.response?.data); // Debugging
      setError(err.response?.data?.message || 'Error rechecking the TDS');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Rejected TDS</h2>
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}
      
      {isLoading ? (
        <div>Loading rejected TDS...</div>
      ) : (
        <>
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
              {rejectedTDSList.length > 0 ? (
                rejectedTDSList.map((tds) => (
                  <tr key={tds.tdsId} style={styles.tr}>
                    <td style={styles.td}>{tds.tdsName}</td>
                    <td style={styles.td}>
                      {tds.documentPath ? (
                        tds.documentPath.split(',').map((path, index) => {
                          const fileName = path.split(/[\\/]/).pop();
                          return (
                            <button
                              key={index}
                              onClick={() => handleViewDocument(path)}
                              style={{ ...styles.viewButton, margin: '4px' }}
                              disabled={isLoading}
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
                    <td style={styles.td}>{tds.project?.projectName || 'N/A'}</td>
                    <td style={styles.td}>{tds.project?.stakeholder?.username || 'N/A'}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.recheckButton}
                        onClick={() => prepareRecheckData(tds)}
                        disabled={isLoading}
                      >
                        Recheck
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={styles.noTDS}>
                    No rejected TDS found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {recheckData.tdsId && (
            <form onSubmit={handleRecheck} style={styles.recheckForm}>
              <h3 style={styles.recheckHeading}>Recheck TDS (ID: {recheckData.tdsId})</h3>
              
              <div style={styles.fileSection}>
                <h4 style={styles.sectionHeading}>Existing Documents</h4>
                {recheckData.existingFiles.length > 0 ? (
                  recheckData.existingFiles.map((filePath, index) => {
                    const fileName = filePath.split(/[\\/]/).pop();
                    const isMarkedForRemoval = recheckData.filesToRemove.includes(filePath);
                    
                    return (
                      <div key={index} style={styles.fileItem}>
                        <span style={isMarkedForRemoval ? styles.removedFile : styles.keptFile}>
                          {fileName}
                        </span>
                        <div style={styles.fileActions}>
                          <button
                            type="button"
                            onClick={() => handleViewDocument(filePath)}
                            style={styles.viewButton}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleFileToRemove(filePath)}
                            style={styles.removeButton}
                          >
                            {isMarkedForRemoval ? 'Undo' : '×'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>No existing documents</p>
                )}
              </div>

              <div style={styles.fileSection}>
                <h4 style={styles.sectionHeading}>Add New Documents</h4>
                <input
                  type="file"
                  onChange={handleFileSelection}
                  style={styles.fileInput}
                  multiple
                  disabled={isLoading}
                />
                <div style={styles.newFilesList}>
                  {recheckData.newFiles.map((file, index) => (
                    <div key={index} style={styles.fileItem}>
                      <span style={styles.newFile}>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeNewFile(index)}
                        style={styles.removeButton}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <label style={styles.label}>
                Remarks:
                <textarea
                  value={recheckData.remarks}
                  onChange={(e) => setRecheckData(prev => ({ ...prev, remarks: e.target.value }))}
                  style={styles.textarea}
                  required
                  disabled={isLoading}
                />
              </label>

              <button
                type="submit"
                style={styles.submitButton}
                disabled={isLoading || 
                  (recheckData.existingFiles.length === recheckData.filesToRemove.length && 
                   recheckData.newFiles.length === 0)}
              >
                {isLoading ? 'Processing...' : 'Submit Recheck'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

// Styles remain the same as in the previous version
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
  recheckButton: {
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
  recheckForm: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '90%',
  },
  recheckHeading: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#333',
  },
  fileSection: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '5px',
  },
  sectionHeading: {
    fontSize: '18px',
    fontWeight: '500',
    marginBottom: '10px',
    color: '#444',
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
    padding: '8px',
    backgroundColor: '#fff',
    borderRadius: '4px',
  },
  fileActions: {
    display: 'flex',
    gap: '8px',
  },
  keptFile: {
    color: '#117285',
    fontWeight: '500',
  },
  removedFile: {
    color: '#999',
    textDecoration: 'line-through',
  },
  newFile: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  fileInput: {
    marginBottom: '10px',
    width: '100%',
  },
  newFilesList: {
    marginTop: '10px',
  },
  removeButton: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#d32f2f',
    }
  },
  label: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#555',
    marginBottom: '10px',
    display: 'block',
  },
  textarea: {
    padding: '10px',
    fontSize: '14px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    width: '100%',
    minHeight: '80px',
    marginBottom: '15px',
    resize: 'vertical',
  },
  submitButton: {
    backgroundColor: '#117285',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    '&:hover:not(:disabled)': {
      backgroundColor: '#0a5171',
    },
    '&:disabled': {
      backgroundColor: '#90caf9',
      cursor: 'not-allowed',
    },
  },
};

export default RejectedTDS;