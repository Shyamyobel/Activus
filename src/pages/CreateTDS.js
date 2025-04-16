import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const CreateTDS = () => {
  const [tdsName, setTdsName] = useState('');
  const [files, setFiles] = useState([]); // change to array
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignedProjects = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('You must log in to create a TDS.');
          return;
        }

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        if (decodedToken.role !== 'SME') {
          setError(`Your current role is ${decodedToken.role || 'undefined'}. Only SMEs can create TDS.`);
          return;
        }

        const response = await axios.get('http://localhost:8080/api/projects/assigned', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.data && response.data.data.length > 0) {
          setProjects(response.data.data);
          setError('');
        } else {
          setError('No projects assigned to you as SME. Please contact your administrator.');
        }
      } catch  {
        console.error('Failed to fetch projects:', );
        setError('Unable to load projects. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignedProjects();
  }, []);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files)); // convert FileList to Array
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (files.length === 0) {
      setError('Please upload at least one PDF document.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must log in to create a TDS.');
      return;
    }

    if (!projectId || isNaN(projectId)) {
      setError('Please select a valid project.');
      return;
    }

    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const username = decodedToken.sub;

    const tdsDTO = {
      tdsName,
      documentPath: '',
      status: 'Draft',
      projectId: Number(projectId),
    };

    const formData = new FormData();
    formData.append('tdsDTO', JSON.stringify(tdsDTO));
    formData.append('username', username);

    files.forEach((file, index) => {
      formData.append('files', file); // backend should handle multiple files under 'files'
    });

    try {
      setIsLoading(true);
      const response = await axios.post(
        'http://localhost:8080/api/tds/create',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setSuccess('TDS created successfully!');
      setTdsName('');
      setFiles([]);
      setProjectId('');
    } catch  {
      setError( 'Failed to create TDS. Please try again.');
  
    } finally {
      setIsLoading(false);
    }
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
      justifyContent: 'flex-start',
    },
    heading: {
      fontSize: '36px',
      fontWeight: '700',
      marginBottom: '20px',
      color: '#333',
    },
    error: {
      color: 'red',
      marginBottom: '15px',
    },
    success: {
      color: 'green',
      marginBottom: '15px',
    },
    form: {
      width: '90%',
      maxWidth: '500px',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      color: '#555',
    },
    input: {
      width: '100%',
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
    },
    select: {
      width: '100%',
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
    },
    fileInput: {
      width: '100%',
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#117285',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
    },
    noProjects: {
      textAlign: 'center',
      padding: '20px',
      fontSize: '16px',
      color: '#999',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create TDS</h2>
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      {isLoading ? (
        <div>Loading...</div>
      ) : projects.length > 0 ? (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              TDS Name:
              <input
                type="text"
                value={tdsName}
                onChange={(e) => setTdsName(e.target.value)}
                style={styles.input}
                required
                placeholder="Enter TDS name"
              />
            </label>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Project:
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                style={styles.select}
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.projectId} value={project.projectId}>
                    {project.projectName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Upload Document(s) (PDF only):
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf"
                style={styles.fileInput}
                multiple
                required
              />
              {files.length > 0 && (
                <div style={{ fontSize: '14px', marginTop: '5px' }}>
                  {files.map((f, i) => (
                    <div key={i}>{f.name}</div>
                  ))}
                </div>
              )}
            </label>
          </div>

          <button 
            type="submit" 
            style={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create TDS'}
          </button>
        </form>
      ) : (
        <div style={styles.noProjects}>
          <p>No projects assigned to you as SME.</p>
          <p>Please contact your administrator to be assigned to a project.</p>
        </div>
      )}
    </div>
  );
};

export default CreateTDS;
