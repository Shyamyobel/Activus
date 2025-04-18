import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const CreateProject = () => {
  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: ''
  });
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roleAssignments, setRoleAssignments] = useState({
    PM: [],
    SME: [],
    Stakeholder: [],
    L1: [],
    L2: [],
    L3: [],
    BU: [],
    Contractor: []
  });
  const router = useRouter();

  useEffect(() => {
    const fetchApprovedUsers = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        
        const response = await axios.get('https://activus-server-production.up.railway.app/api/auth/approved-users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApprovedUsers(response.data.data || []);
      } catch  {
        console.error('Failed to fetch approved users:');
        setError( 'Unable to load users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchApprovedUsers();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleAssignment = (role, userId, isChecked) => {
    setRoleAssignments(prev => ({
      ...prev,
      [role]: isChecked 
        ? [...new Set([...prev[role], userId])] // Prevent duplicates
        : prev[role].filter(id => id !== userId)
    }));
  };

  const validateForm = () => {
    const requiredRoles = ['PM', 'SME', 'Stakeholder', 'L1', 'BU', 'Contractor'];
    
    for (const role of requiredRoles) {
      if (roleAssignments[role].length === 0) {
        return `Please select at least one ${role}`;
      }
    }

    if (!formData.projectName.trim()) {
      return 'Project name is required';
    }

    if (!formData.projectDescription.trim()) {
      return 'Project description is required';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      await axios.post('https://activus-server-production.up.railway.app/api/projects/create', {
        projectName: formData.projectName,
        projectDescription: formData.projectDescription,
        stakeholderId: roleAssignments.Stakeholder[0],
        roleAssignments
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Project created successfully! Redirecting...');
      setTimeout(() => router.push('/ProjectsPage'), 1500);
    } catch {
      console.error('Project creation failed:');
      setError('Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const getUsersByRole = (role) => approvedUsers.filter(user => user.role === role);
  const isRoleRequired = (role) => !['L2', 'L3'].includes(role);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create New Project</h2>
      
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Project Name:
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              style={styles.input}
              required
              placeholder="Enter project name"
              disabled={isLoading}
            />
          </label>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Project Description:
            <textarea
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleInputChange}
              style={styles.textarea}
              required
              placeholder="Describe the project"
              disabled={isLoading}
            />
          </label>
        </div>

        <div style={styles.rolesSection}>
          <h3 style={styles.subHeading}>Assign Team Members</h3>
          <p style={styles.note}>Roles marked with <span style={styles.requiredAsterisk}>*</span> are required</p>
          
          {Object.keys(roleAssignments).map(role => (
            <div key={role} style={styles.roleCard}>
              <h4 style={styles.roleHeader}>
                {role} 
                {isRoleRequired(role) && <span style={styles.requiredAsterisk}>*</span>}
              </h4>
              
              {isLoading && approvedUsers.length === 0 ? (
                <p style={styles.loadingText}>Loading users...</p>
              ) : getUsersByRole(role).length > 0 ? (
                <div style={styles.userGrid}>
                  {getUsersByRole(role).map(user => (
                    <label key={user.id} style={styles.userLabel}>
                      <input
                        type="checkbox"
                        checked={roleAssignments[role].includes(user.id)}
                        onChange={(e) => handleRoleAssignment(role, user.id, e.target.checked)}
                        style={styles.checkbox}
                        disabled={isLoading}
                      />
                      <span style={styles.username}>{user.username}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p style={styles.noUsers}>No approved {role} available</p>
              )}
            </div>
          ))}
        </div>

        <button 
          type="submit" 
          style={{ 
            ...styles.submitButton, 
            ...(isLoading && styles.disabledButton) 
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span style={styles.spinner}></span>
              Creating...
            </>
          ) : (
            '🚀 Create Project'
          )}
        </button>
      </form>
    </div>
  );
};

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
  form: {
    width: '100%',
    maxWidth: '900px',
    backgroundColor: 'white',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '1rem',
    color: '#34495e',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #bdc3c7',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    ':focus': {
      borderColor: '#3498db',
      boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)'
    }
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #bdc3c7',
    fontSize: '1rem',
    resize: 'vertical',
    transition: 'all 0.3s ease',
    ':focus': {
      borderColor: '#3498db',
      boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.2)'
    }
  },
  rolesSection: {
    margin: '2rem 0',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    border: '1px solid #e9ecef'
  },
  subHeading: {
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    color: '#2c3e50',
    fontWeight: '600'
  },
  note: {
    color: '#666',
    fontSize: '0.9rem',
    marginBottom: '1.5rem'
  },
  roleCard: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  roleHeader: {
    fontSize: '1.1rem',
    marginBottom: '1rem',
    color: '#117285',
    fontWeight: '600',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #f1f1f1',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  requiredAsterisk: {
    color: '#e74c3c',
    fontSize: '1.2rem'
  },
  userGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px'
  },
  userLabel: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '6px',
    backgroundColor: '#f8f9fa',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#e9ecef'
    }
  },
  checkbox: {
    marginRight: '10px',
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  username: {
    fontSize: '0.95rem',
    color: '#495057'
  },
  noUsers: {
    color: '#868e96',
    fontStyle: 'italic',
    fontSize: '0.9rem',
    padding: '8px 0'
  },
  loadingText: {
    color: '#666',
    fontStyle: 'italic'
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#117285',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    ':hover': {
      backgroundColor: '#0d5d6b',
      transform: 'translateY(-2px)'
    },
    ':active': {
      transform: 'translateY(0)'
    }
  },
  disabledButton: {
    opacity: 0.7,
    cursor: 'not-allowed',
    ':hover': {
      transform: 'none',
      backgroundColor: '#117285'
    }
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    borderTopColor: '#fff',
    animation: 'spin 1s ease-in-out infinite',
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
  }
};

export default CreateProject;