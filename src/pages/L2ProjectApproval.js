import React, { useState, useEffect } from 'react';
import axios from 'axios';

const L2ProjectApproval = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Fetch projects requiring L2 validation
    if (!token) {
      setError('You must log in to view projects.');
      return;
    }

    axios
      .get('http://localhost:8080/api/projects/l2-validation', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setProjects(response.data.data || []);
        setError('');
      })
      .catch((err) => {
        setError('Error fetching projects.');
        console.error(err);
      });
  }, [token]);

  const handleApproval = (projectId, isApproved) => {
    if (!token) {
      setError('You must log in to perform this action.');
      return;
    }

    axios
      .put(
        `http://localhost:8080/api/projects/review/${projectId}?isApproved=${isApproved}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        alert(`Project ${isApproved ? 'approved' : 'disapproved'} successfully!`);
        // Remove the project from the list after approval/rejection
        setProjects(projects.filter((project) => project.projectId !== projectId));
      })
      .catch((err) => {
        setError(`Error ${isApproved ? 'approving' : 'disapproving'} the project.`);
        console.error(err);
      });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>L2 Project Approval</h2>
      {error && <p style={styles.error}>{error}</p>}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Project Name</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Remarks</th>
            <th style={styles.th}>Created By</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {projects.length > 0 ? (
            projects.map((project) => (
              <tr key={project.projectId} style={styles.tr}>
                <td style={styles.td}>{project.projectName}</td>
                <td style={styles.td}>{project.projectDescription}</td>
                <td style={styles.td}>
                  {project.projectStatus ? 'Active' : 'In Progress'}
                </td>
                <td style={styles.td}>{project.remarks}</td>
                <td style={styles.td}>{project.stakeholder?.username}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleApproval(project.projectId, true)}
                    style={styles.approveButton}
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => handleApproval(project.projectId, false)}
                    style={styles.rejectButton}
                  >
                    ❌ Disapprove
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={styles.noProjects}>
                No projects found for approval.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Styles
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
  approveButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    margin: '5px 0',
    transition: 'transform 0.3s ease, background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#45a049',
      transform: 'scale(1.05)',
    },
  },
  rejectButton: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    margin: '5px 0',
    transition: 'transform 0.3s ease, background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#e53935',
      transform: 'scale(1.05)',
    },
  },
  noProjects: {
    textAlign: 'center',
    padding: '20px',
    fontSize: '16px',
    color: '#999',
    fontStyle: 'italic',
  },
};

export default L2ProjectApproval;