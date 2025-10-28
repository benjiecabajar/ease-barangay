import { useState, useEffect } from 'react';
import "../styles/login.css";
import "@fontsource/poppins";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaBullhorn, FaFileContract, FaExclamationTriangle } from 'react-icons/fa';
import { Link, useNavigate } from "react-router-dom";
import { logAuditAction } from "../utils/auditLogger";


function Login() {
  const [role, setRole] = useState(null); 
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [notification, setNotification] = useState(''); 
  // NEW STATE: To track the "Remember me" checkbox status
  const [rememberMe, setRememberMe] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const navigate = useNavigate();

  // useEffect runs once on component mount to check local storage
  useEffect(() => {
    // 1. Check if the "Remember me" box was checked previously
    const storedRememberMe = localStorage.getItem('rememberMe') === 'true';
    setRememberMe(storedRememberMe);

    // 2. If it was checked, retrieve the stored username
    if (storedRememberMe) {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    } 
  }, []);

  const handleLogin = async () => {
    if (isLoggingIn) return;

    if (!username || !password) {
      setNotification("Please enter both username and password.");
      logAuditAction('Login Attempt Failed', { username, reason: 'Missing credentials' });
      return;
    }

    setIsLoggingIn(true);
    setNotification(''); 

    // Simulate network delay for a better UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    // --- REMEMBER ME LOGIC ---
    if (rememberMe) {
      // If "Remember me" is checked, save username and the flag
      localStorage.setItem('username', username);
      localStorage.setItem('rememberMe', 'true');
    } else {
      // If not checked, remove any previously saved username/flag
      localStorage.removeItem('username');
      localStorage.removeItem('rememberMe');
    }
    // ------------------------

    // (Optional) Add authentication logic here
    if (username.toLowerCase() === 'admin') {
      const userProfile = { id: 'admin_user', name: 'Admin' };
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      logAuditAction('Admin Logged In', { username }, 'admin');
      navigate("/admin");
    } else if (username.toLowerCase() === 'moderator') {
      const userProfile = { id: 'moderator_user', name: 'Moderator' };
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      logAuditAction('Moderator Logged In', { username }, 'moderator');
      navigate("/moderator");
    } else {
      // For other users, create a profile. In a real app, you'd fetch this from a DB.
      const userProfile = {
        // Simple way to create a consistent ID from username for this example
        id: `user_${username.toLowerCase().replace(/[^a-z0-9]/g, '')}`, 
        name: username 
      };
      localStorage.setItem('userProfile', JSON.stringify(userProfile));

      // Pass the role to the audit logger
      logAuditAction('User Logged In', { username }, 'resident');
      navigate("/resident");
    }

    setIsLoggingIn(false);
  };

  return (
    <div className="login-page">
      <div className="login-content-wrapper">
        <div className="login-promo">
          <div className="promo-content">
            <h1>Welcome to Ease Barangay</h1>
            <p>Your digital hub for community services and information. Log in to access a world of convenience.</p>
            <ul className="promo-features">
              <li><FaBullhorn className="promo-icon" /> Stay updated with real-time announcements.</li>
              <li><FaFileContract className="promo-icon" /> Request documents with just a few clicks.</li>
              <li><FaExclamationTriangle className="promo-icon" /> Report community concerns effortlessly.</li>
            </ul>
          </div>
        </div>

        <div className="login-box">
          <h1>Login</h1>
          <h2>----</h2>
          <h3>Please enter your credentials.</h3>

          <label className="input-label">Username</label>
          <div className="input-container">
            <FaUser className="input-icon" />
            <input 
              type="text" 
              placeholder="Enter your username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <label className="input-label">Password</label>
          <div className="input-container">
            <FaLock className="input-icon" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <div className="options">
            <label>
              <input 
                  type="checkbox" 
                  checked={rememberMe} // Bind checked state
                  onChange={(e) => setRememberMe(e.target.checked)} // Update state on change
              /> Remember me
            </label>
            <a href="#">Forgot password</a>
          </div>

          {notification && <p className="notification">{notification}</p>}

          <button className="login-btn" onClick={handleLogin} disabled={isLoggingIn}>
            {isLoggingIn ? (
              <><div className="spinner"></div> Logging In...</>
            ) : (
              'LOGIN'
            )}
          </button>

          <p className="signin-text">
            Don’t have an account? <Link to="/sign-in">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login; 