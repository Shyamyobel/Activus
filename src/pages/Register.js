//src>>pages>>Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [emailId, setEmailId] = useState('');
  const [role, setRole] = useState('SME');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', {
        username,
        password,
        emailId,
        role,
      });
      console.log('Registration successful:', response.data);
      router.push('/login'); // Redirect to login after registration
    } catch (error) {
      console.error('Registration failed:', error.response?.data || error.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.header}>Register</h1>
        <form onSubmit={handleRegister}>
          {/* Username Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Email Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              style={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Role Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.input}
              placeholder="Enter your role"
              required
            />
          </div>

          {/* Register Button */}
          <button type="submit" style={styles.button}>
            Register
          </button>

          {/* Login Link */}
          <p style={styles.text}>
            Already a member?{' '}
            <Link href="/login" passHref>
  <a style={styles.link}>Login now</a>
</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

// Reuse the same styles from the Login page
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#117285', // Page background
  },
  card: {
    backgroundColor: '#F3F4F6', // Card background
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  header: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1E40AF', // Header text color
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  inputGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: '#111827', // Label text color
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #D1D5DB', // Input border color
    borderRadius: '4px',
    backgroundColor: '#FFFFFF', // Input background
    fontSize: '1rem',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#1E40AF', // Button background
    color: '#FFFFFF', // Button text color
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  link: {
    color: '#3B82F6', // Link text color
    textDecoration: 'none',
    fontSize: '0.875rem',
  },
  text: {
    textAlign: 'center',
    marginTop: '1rem',
    color: '#111827', // Text color
  },
};

export default Register;