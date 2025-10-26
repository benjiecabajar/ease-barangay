import { useState, useEffect } from "react";
import "../styles/login.css";
import "@fontsource/poppins";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
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

  const handleLogin = () => {
    if (!username || !password) {
      setNotification("Please enter both username and password.");
      logAuditAction('Login Attempt Failed', { username, reason: 'Missing credentials' });
      return;
    }

    setNotification(''); 

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
    
    // Redirect on success
    logAuditAction('User Logged In', { username });
    navigate("/resident");
  };

  return (
    <div className="login-page">
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

        <button className="login-btn" onClick={handleLogin}>LOGIN</button>

        <p className="signin-text">
          Don’t have an account? <Link to="/sign-in">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login; 