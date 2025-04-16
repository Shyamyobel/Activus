import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const L1ProjectUserUpdate = () => {
  const [projects, setProjects] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [roleUpdates, setRoleUpdates] = useState({ L2: [], L3: [] });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getCurrentUser = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return {
        username: decoded.sub,
        role: decoded.role
      };
    } catch (e) {
      console.error('Failed to decode token:', e);
      return null;
    }
  };

  const fetchProjects = async (username, token) => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://localhost:8080/api/projects/assigned-to-user/${username}?role=L1`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setProjects(response.data.data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again.');
    }
  };

  const fetchUsers = async (token) => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/auth/approved-users',
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setAvailableUsers(response.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const token = localStorage.getItem('token');
      await Promise.all([
        fetchProjects(currentUser.username, token),
        fetchUsers(token)
      ]);
      setIsLoading(false);
    };

    loadData();
  }, [router]);

  const handleEdit = (project) => {
    setSelectedProject(project);
    setRoleUpdates({
      L2: project.roleUsers?.L2?.map(u => u.id) || [],
      L3: project.roleUsers?.L3?.map(u => u.id) || []
    });
  };

  const handleRoleChange = (role, userId, checked) => {
    setRoleUpdates(prev => ({
      ...prev,
      [role]: checked 
        ? [...prev[role], userId]
        : prev[role].filter(id => id !== userId)
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const token = localStorage.getItem('token');
      
      // Prepare clean payload
      const payload = {
        L2: roleUpdates.L2.filter(id => typeof id === 'number'),
        L3: roleUpdates.L3.filter(id => typeof id === 'number')
      };

      const response = await axios.put(
        `http://localhost:8080/api/projects/update/${selectedProject.projectId}`,
        payload,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          validateStatus: (status) => status < 500
        }
      );

      if (response.data.status >= 400) {
        throw new Error(response.data.message || 'Update failed');
      }

      setSuccess('Team updated successfully!');
      
      // Optimistic UI update
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.projectId === selectedProject.projectId
            ? {
                ...project,
                roleUsers: {
                  ...project.roleUsers,
                  L2: availableUsers.filter(u => payload.L2.includes(u.id)),
                  L3: availableUsers.filter(u => payload.L3.includes(u.id))
                }
              }
            : project
        )
      );

      setTimeout(() => setSelectedProject(null), 1500);

    } catch (err) {
      console.error('Update error:', err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to update team. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getUsersByRole = (role) => {
    return availableUsers.filter(user => user.role === role);
  };

  // Styles
  const styles = {
    container: {
      padding: '40px',
      fontFamily: '"Roboto", sans-serif',
      background: 'linear-gradient(to right, #eef2f3, #8e9eab)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    heading: {
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '2rem',
      color: '#2c3e50',
      textShadow: '1px 1px 3px rgba(0,0,0,0.1)'
    },
    error: {
      color: '#e74c3c',
      backgroundColor: '#fadbd8',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '1.5rem',
      width: '100%',
      maxWidth: '900px',
      textAlign: 'center'
    },
    success: {
      color: '#27ae60',
      backgroundColor: '#d5f5e3',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '1.5rem',
      width: '100%',
      maxWidth: '900px',
      textAlign: 'center'
    },
    projectList: {
      width: '100%',
      maxWidth: '900px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '2rem'
    },
    projectCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column'
    },
    editButton: {
      padding: '10px 15px',
      backgroundColor: '#117285',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      marginTop: '15px',
      fontSize: '0.95rem',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#0d5d6b'
      }
    },
    modal: {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '1000'
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '700px',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    roleSection: {
      marginBottom: '25px',
      padding: '15px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px'
    },
    userGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '10px',
      marginTop: '15px'
    },
    userLabel: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      backgroundColor: 'white',
      borderRadius: '6px',
      border: '1px solid #e0e0e0',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#f0f0f0'
      }
    },
    checkbox: {
      marginRight: '10px',
      width: '16px',
      height: '16px',
      cursor: 'pointer'
    },
    submitButton: {
      padding: '12px 20px',
      backgroundColor: '#117285',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#0d5d6b'
      }
    },
    closeButton: {
      padding: '12px 20px',
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      marginRight: '15px',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#c0392b'
      }
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '20px'
    },
    loading: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100px'
    },
    noProjects: {
      textAlign: 'center',
      padding: '30px',
      backgroundColor: 'white',
      borderRadius: '10px',
      maxWidth: '600px'
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Manage Project Teams</h2>
      
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {isLoading && projects.length === 0 ? (
        <div style={styles.loading}>Loading your projects...</div>
      ) : projects.length > 0 ? (
        <div style={styles.projectList}>
          {projects.map(project => (
            <div key={project.projectId} style={styles.projectCard}>
              <h3>{project.projectName}</h3>
              <p style={{ color: '#555', marginBottom: '10px' }}>
                {project.projectDescription}
              </p>
              <div style={{ marginBottom: '10px' }}>
                <strong>Current Team:</strong>
                {project.roleUsers?.L2?.length > 0 && (
                  <p>L2: {project.roleUsers.L2.map(u => u.username).join(', ')}</p>
                )}
                {project.roleUsers?.L3?.length > 0 && (
                  <p>L3: {project.roleUsers.L3.map(u => u.username).join(', ')}</p>
                )}
              </div>
              <button 
                style={styles.editButton}
                onClick={() => handleEdit(project)}
                disabled={isLoading}
              >
                Edit Team
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.noProjects}>
          <p>No projects assigned to you as L1.</p>
          <p>Please contact your administrator if you believe this is incorrect.</p>
        </div>
      )}

      {selectedProject && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
              Edit Team for {selectedProject.projectName}
            </h3>
            
            {['L2', 'L3'].map(role => (
              <div key={role} style={styles.roleSection}>
                <h4 style={{ color: '#117285', marginBottom: '15px' }}>
                  {role} Members
                </h4>
                {getUsersByRole(role).length > 0 ? (
                  <div style={styles.userGrid}>
                    {getUsersByRole(role).map(user => (
                      <label key={user.id} style={styles.userLabel}>
                        <input
                          type="checkbox"
                          checked={roleUpdates[role]?.includes(user.id)}
                          onChange={(e) => handleRoleChange(role, user.id, e.target.checked)}
                          style={styles.checkbox}
                          disabled={isLoading}
                        />
                        {user.username}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#777', fontStyle: 'italic' }}>
                    No {role} users available
                  </p>
                )}
              </div>
            ))}

            <div style={styles.buttonGroup}>
              <button 
                style={styles.closeButton}
                onClick={() => setSelectedProject(null)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                style={styles.submitButton}
                onClick={handleSubmit}
                disabled={isLoading || 
                  (roleUpdates.L2.length === 0 && roleUpdates.L3.length === 0)}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default L1ProjectUserUpdate;