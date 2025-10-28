import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { logAuditAction } from '../utils/auditLogger';
import '../styles/admin-login.css';

function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [notification, setNotification] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = () => {
        if (!username || !password) {
            setNotification('Please enter both username and password.');
            logAuditAction('Admin Login Failed', { username, reason: 'Missing credentials' }, 'admin');
            return;
        }

        // Simple authentication for demonstration
        if (username.toLowerCase() === 'admin' && password === 'admin123') {
            const userProfile = { id: 'admin_user', name: 'Admin', role: 'admin' };
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            logAuditAction('Admin Logged In', { username }, 'admin');
            navigate('/admin');
        } else {
            setNotification('Invalid username or password.');
            logAuditAction('Admin Login Failed', { username, reason: 'Invalid credentials' }, 'admin');
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-box">
                <h1>Admin Portal</h1>
                <h2>Welcome Back</h2>
                <h3>Enter your administrator credentials to continue.</h3>

                <div className="input-container">
                    <FaUserShield className="input-icon" />
                    <input
                        type="text"
                        placeholder="Admin Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="input-container">
                    <FaLock className="input-icon" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </div>
                </div>

                {notification && <p className="notification">{notification}</p>}

                <button className="admin-login-btn" onClick={handleLogin}>Secure Login</button>
            </div>
        </div>
    );
}

export default AdminLogin;