import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";
import "../styles/sign_in.css";
import "@fontsource/poppins";
import { logAuditAction } from "../utils/auditLogger";
import TermsModal from "../components/modal-terms";

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "", 
    gender: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    barangay: "",
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState("");
  const [signupStatus, setSignupStatus] = useState(null); // To show confirmation screen
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [hasViewedTerms, setHasViewedTerms] = useState(false);
  // NEW STATE: Tracks if the user has manually changed the username

  const barangays = [
    "Balacanas",
    "Dayawan",
    "Imelda",
    "Katipunan",
    "Kimaya",
    "Looc",
    "Poblacion 1",
    "Poblacion 2",
    "Poblacion 3",
    "San Martin",
    "Tambobong",
  ];

  // Function to validate the email format 
  const validateEmail = (email) => 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear errors and notifications
    setErrors((prevErrors) => ({ ...prevErrors, [name]: false }));
    if (name !== 'terms') setErrors((prevErrors) => ({ ...prevErrors, terms: false }));
    setNotification("");
    
    const newForm = { ...form, [name]: value };
    setForm(newForm);

    // 2. Handle Live Email validation
    if (name === "email") {
      if (value && !validateEmail(value)) {
        setErrors((prevErrors) => ({ ...prevErrors, email: "invalid" }));
        setNotification("Please enter a valid email address (e.g., example@domain.com).");
      } else {
        setErrors((prevErrors) => {
          const { email, ...rest } = prevErrors;
          return rest;
        });
      }
    }
  };

  /**
   * PASSWORD VALIDATION:
   * Requires a minimum of 6 characters.
   */
  const validatePassword = (password) => 
    /^.{6,}$/.test(password); 

  const handleSubmit = () => {
    let newErrors = {};
    let currentNotification = "";

    // 1. Check empty fields
    Object.keys(form).forEach((key) => {
      if (!form[key]) newErrors[key] = true; 
    });
    
    // 2. Email validation
    if (form.email && !validateEmail(form.email)) {
        newErrors.email = "invalid";
        currentNotification = "Please enter a valid email address (e.g., example@domain.com).";
    }

    // 3. Date of Birth (DOB) Validation: Check if DOB is in the future
    if (form.dob) {
      const selectedDate = new Date(form.dob);
      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      if (selectedDate > today) {
        newErrors.dob = "future";
        currentNotification = "Date of Birth cannot be in the future.";
      }
    }

    // 4. Password validation
    if (form.password && !validatePassword(form.password)) {
      newErrors.password = true;
      currentNotification =
        "Password must be at least 6 characters long.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = true;
      currentNotification = "Passwords do not match.";
    }

    // 5. Check Terms and Conditions
    if (!termsAccepted) {
      newErrors.terms = true;
      if (!currentNotification) currentNotification = "You must accept the Terms and Conditions to sign up.";
    }
    // 5. Set general notification for empty fields only if no other specific error message has been set
    if (Object.keys(newErrors).some(key => newErrors[key] === true) && !currentNotification) {
      currentNotification = "Please fill in all required fields!";
    }

    setNotification(currentNotification);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Form submitted:", form);
    
    const registerUser = async () => {
      setSignupStatus('submitting');
      try {
        // In a real app, this would be your backend API endpoint
        // const response = await fetch('/api/register', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(form),
        // });
        // if (!response.ok) {
        //   throw new Error('Registration failed');
        // }

        // --- SIMULATION of a successful API call ---
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Simulated registration successful.");
        // --- END SIMULATION ---

        logAuditAction(
          'User Account Created', 
          { username: form.username, email: form.email }, 
          'resident'
        );
        setSignupStatus('success');
      } catch (error) {
        console.error("Registration error:", error);
        setNotification("Registration failed. Please try again later.");
        setSignupStatus(null); // Reset status to allow retry
      }
    };

    registerUser();
  };

  return (
    <div className="sign-page">
      <TermsModal 
        isOpen={isTermsModalOpen}
        onClose={() => {
          setHasViewedTerms(true); // Mark as viewed even if they just close it
          setIsTermsModalOpen(false);
        }}
      />

      {signupStatus === 'success' ? (
        <div className="sign-box success-confirmation">
          <svg className="success-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2"/>
            <path d="M8 12L11 15L16 9" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1>Account Created!</h1>
          <p className="confirmation-text">
            A confirmation link has been sent to <strong>{form.email}</strong>. Please check your inbox to verify your account.
          </p>
          <button className="signin-btn" onClick={() => navigate('/login')}>
            Proceed to Login
          </button>
        </div>
      ) : (
        <div className="sign-box">
        <h1>Sign Up</h1>
        <h2>___</h2>
        <h3>Fill up information</h3>

        <div className="info-inputs">
          <div className="name-column">
            <input
              name="firstName"
              placeholder="First name"
              value={form.firstName}
              onChange={handleChange}
              className={errors.firstName ? "error-input" : ""}
            />
            <input
              name="lastName"
              placeholder="Last name"
              value={form.lastName}
              onChange={handleChange}
              className={errors.lastName ? "error-input" : ""}
            />
          </div>

          <div className="extra-info">
            <label>Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
              className={errors.dob ? "error-input" : ""} 
            />

            <label>Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className={errors.gender ? "error-input" : ""}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? "error-input" : ""}
          />
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className={errors.username ? "error-input" : ""}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className={errors.password ? "error-input" : ""}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? "error-input" : ""}
          />

          <select
            name="barangay"
            value={form.barangay}
            onChange={handleChange}
            className={errors.barangay ? "error-input" : ""}
          >
            <option value="">Select Barangay</option>
            {barangays.map((brgy, index) => (
              <option key={index} value={brgy}>
                {brgy}
              </option>
            ))}
          </select>
        </div>

        <div className="terms-container">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => {
              if (hasViewedTerms) {
                setTermsAccepted(e.target.checked);
              } else {
                setNotification("Please click to read the Terms and Conditions before accepting.");
              }
            }}
            className={errors.terms ? "error-checkbox" : ""}
          />
          <label htmlFor="terms">
            I agree to the <span 
              className="terms-link"
              onClick={() => { setHasViewedTerms(true); setIsTermsModalOpen(true); }}>
                Terms and Conditions
            </span>
          </label>
        </div>

        {notification && <p className="notification">{notification}</p>}

        <button className="signin-btn" onClick={handleSubmit}>
          {signupStatus === 'submitting' ? 'Creating Account...' : 'Sign Up'}
        </button>

        <p className="signup-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
        </div>
      )}
      </div>
  );
}