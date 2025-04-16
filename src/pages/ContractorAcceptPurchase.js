import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContractorAcceptPurchase = () => {
  const [tdsList, setTdsList] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedTds, setSelectedTds] = useState(null);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [lrCopy, setLrCopy] = useState(null);
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
    } catch (err) {
      setError('Invalid token. Please log in again.');
    }
  }, []);

  const fetchPmApprovedTDS = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.get(
        'http://localhost:8080/api/tds/pmApproved',
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { username }
        }
      );
      setTdsList(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch PM-approved TDS');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && username) {
      fetchPmApprovedTDS();
    }
  }, [token, username]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === 'order') {
      setOrderConfirmation(file);
    } else {
      setLrCopy(file);
    }
  };

  const handleFinalizePurchase = async (tdsId) => {
    if (!orderConfirmation || !lrCopy) {
      setError('Please upload both Order Confirmation and LR Copy');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData();
      formData.append('orderConfirmation', orderConfirmation);
      formData.append('lrCopy', lrCopy);

      const response = await axios.post(
        `http://localhost:8080/api/tds/finalizePurchase/${tdsId}`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          params: { username }
        }
      );

      setSuccess('Purchase finalized successfully with documents uploaded!');
      setTdsList(tdsList.filter((tds) => tds.tdsId !== tdsId));
      setSelectedTds(null);
      setOrderConfirmation(null);
      setLrCopy(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to finalize purchase');
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
      <h2 style={styles.heading}>Finalize Purchase</h2>
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}
      
      {isLoading ? (
        <div>Loading PM-approved TDS data...</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>TDS Name</th>
              <th style={styles.th}>Document</th>
              <th style={styles.th}>Status</th>
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
                        const fileName = path.split(/[\\/]/).pop();
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
                  <td style={styles.td}>{tds.project?.projectName || 'N/A'}</td>
                  <td style={styles.td}>{tds.project?.stakeholder?.username || 'N/A'}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => setSelectedTds(tds)}
                      style={styles.acceptButton}
                      disabled={isLoading}
                    >
                      Finalize Purchase
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={styles.noTDS}>
                  No PM-approved TDS items found for your projects.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {selectedTds && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Finalize Purchase for {selectedTds.tdsName}</h3>
            <div style={styles.formGroup}>
              <label style={styles.label}>Order Confirmation:</label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'order')}
                style={styles.fileInput}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required
              />
              {orderConfirmation && (
                <span style={styles.fileName}>{orderConfirmation.name}</span>
              )}
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>LR Copy:</label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'lr')}
                style={styles.fileInput}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required
              />
              {lrCopy && (
                <span style={styles.fileName}>{lrCopy.name}</span>
              )}
            </div>
            <div style={styles.buttonGroup}>
              <button
                onClick={() => handleFinalizePurchase(selectedTds.tdsId)}
                style={styles.submitButton}
                disabled={isLoading || !orderConfirmation || !lrCopy}
              >
                {isLoading ? 'Processing...' : 'Submit Documents'}
              </button>
              <button
                onClick={() => {
                  setSelectedTds(null);
                  setOrderConfirmation(null);
                  setLrCopy(null);
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles remain exactly the same as in your original code
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
  acceptButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, background-color 0.3s ease',
    '&:hover:not(:disabled)': {
      backgroundColor: '#45a049',
      transform: 'scale(1.05)',
    },
    '&:disabled': {
      backgroundColor: '#a5d6a7',
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
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    width: '500px',
    maxWidth: '90%',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#555',
  },
  fileInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  fileName: {
    display: 'block',
    marginTop: '8px',
    color: '#666',
    fontSize: '14px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
    '&:hover:not(:disabled)': {
      backgroundColor: '#45a049',
    },
    '&:disabled': {
      backgroundColor: '#a5d6a7',
      cursor: 'not-allowed',
    },
  },
  cancelButton: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: '#d32f2f',
    },
  },
};

export default ContractorAcceptPurchase;