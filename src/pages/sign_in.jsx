import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";
import "../styles/sign_in.css";
import "@fontsource/poppins";
import { FaUser, FaCalendarAlt, FaVenusMars, FaEnvelope, FaLock, FaMapMarkerAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { logAuditAction } from "../utils/auditLogger";
import TermsModal from "../components/modal-terms";

const PasswordStrengthIndicator = ({ password = '' }) => {
  const calculateStrength = (password) => {
    let score = 0;
    if (!password) return 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score > 5) return 4;
    if (score > 3) return 3;
    if (score > 1) return 2;
    if (score > 0) return 1;
    return 0;
  };

  const strength = calculateStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
  const strengthColors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e'];

  return (
    <div className="password-strength-container" style={{ '--strength-color': strengthColors[strength] }}>
      <div className="strength-bar" style={{ width: `${(strength + 1) * 20}%` }} />
    </div>
  );
};

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    
    // Live DOB validation
    if (name === 'dob') {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate > today) {
            setErrors(prev => ({ ...prev, dob: 'future' }));
            setNotification("Date of Birth cannot be in the future.");
        } else {
            let age = today.getFullYear() - selectedDate.getFullYear();
            const m = today.getMonth() - selectedDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < selectedDate.getDate())) {
                age--;
            }
            if (age < 12) {
                setErrors(prev => ({ ...prev, dob: 'age' }));
                setNotification("You must be at least 12 years old to sign up.");
            }
        }
    }

    // 3. Handle Live Password Confirmation validation
    if (name === 'password' || name === 'confirmPassword') {
        const password = name === 'password' ? value : form.password;
        const confirmPassword = name === 'confirmPassword' ? value : form.confirmPassword;

        if (password && confirmPassword && password !== confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: true }));
        } else {
            setErrors(prev => ({ ...prev, confirmPassword: false }));
        }
    }
  };

  const handleOpenTerms = () => {
    let newErrors = {};
    let currentNotification = "";

    // Run all validations before opening
    Object.keys(form).forEach((key) => {
      if (!form[key] && key !== 'middleName') newErrors[key] = true;
    });

    if (form.email && !validateEmail(form.email)) {
      newErrors.email = "invalid";
      currentNotification = "Please enter a valid email address.";
    }

    if (form.dob) {
      const selectedDate = new Date(form.dob);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        newErrors.dob = "future";
        currentNotification = "Date of Birth cannot be in the future.";
      } else {
        let age = today.getFullYear() - selectedDate.getFullYear();
        const m = today.getMonth() - selectedDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < selectedDate.getDate())) age--;
        if (age < 12) {
          newErrors.dob = "age";
          currentNotification = "You must be at least 12 years old.";
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setNotification(currentNotification || "Please fill in all required fields before proceeding.");
    } else {
      setIsTermsModalOpen(true);
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
      if (!form[key] && key !== 'middleName') newErrors[key] = true; 
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
      } else {
        // Age validation
        let age = today.getFullYear() - selectedDate.getFullYear();
        const m = today.getMonth() - selectedDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < selectedDate.getDate())) {
            age--;
        }
        if (age < 12) {
            newErrors.dob = "age";
            currentNotification = "You must be at least 12 years old to sign up.";
        }
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
        <h2>------</h2>
        <h3>Fill up information</h3>

        <div className="info-inputs form-category">
            <h4 className="form-category-header">Personal Information</h4>
            <div className="name-column">
                <input name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} className={`no-icon ${errors.firstName ? "error-input" : ""}`} />
                <input name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} className={`no-icon ${errors.lastName ? "error-input" : ""}`} />
                <input name="middleName" placeholder="M.I." value={form.middleName} onChange={handleChange} className="no-icon middle-initial-input" maxLength="1" />
            </div>
        </div>

        <div className="info-inputs form-category">
            <h4 className="form-category-header">Extra Information</h4>
            <div className="extra-info">
                <div className="input-container">
                    <FaCalendarAlt className="input-icon" />
                    <input type="date" name="dob" value={form.dob} onChange={handleChange} className={errors.dob ? "error-input" : ""} />
                </div>
                <div className="input-container">
                    <FaVenusMars className="input-icon" />
                    <select name="gender" value={form.gender} onChange={handleChange} className={errors.gender ? "error-input" : ""}> <option value="">Select gender</option> <option value="male">Male</option> <option value="female">Female</option> <option value="other">Other</option> </select>
                </div>
            </div>
        </div>

        <div className="info-inputs form-category">
            <h4 className="form-category-header">Account Security</h4>
            <div className="input-container"> <FaEnvelope className="input-icon" /> <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className={errors.email ? "error-input" : ""} /> </div>
            <div className="input-container"> <FaUser className="input-icon" /> <input name="username" placeholder="Username" value={form.username} onChange={handleChange} className={errors.username ? "error-input" : ""} /> </div>
            <div className="input-container">
                <FaLock className="input-icon" />
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={form.password} onChange={handleChange} className={errors.password ? "error-input" : ""} />
                <div className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
            </div>
            {form.password && <PasswordStrengthIndicator password={form.password} />}

            <div className="input-container">
                <FaLock className="input-icon" />
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange} className={errors.confirmPassword ? "error-input" : ""} />
                <div className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
            </div>
        </div>

        <div className="info-inputs form-category">
            <h4 className="form-category-header">Location</h4>
            <div className="input-container"> <FaMapMarkerAlt className="input-icon" /> <select name="barangay" value={form.barangay} onChange={handleChange} className={errors.barangay ? "error-input" : ""}> <option value="">Select Barangay</option> {barangays.map((brgy, index) => ( <option key={index} value={brgy}>{brgy}</option> ))} </select> </div>
        </div>


        <div className="terms-container">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => {
              // Create a temporary error object to check form validity
              const tempErrors = { ...errors };
              delete tempErrors.terms; // Don't count the terms error itself

              if (Object.values(tempErrors).some(v => v)) {
                setNotification("Please correct the errors before accepting the terms.");
                return; // Prevent checking
              }

              if (hasViewedTerms || e.target.checked) { // Allow checking if viewed, or unchecking anytime
                  setTermsAccepted(e.target.checked);
              } else {
                setNotification("Please click to read the Terms and Conditions before accepting.");
              }
            }}
          />
          <label htmlFor="terms">
            I agree to the <span 
              className="terms-link" onClick={handleOpenTerms}>Terms and Conditions</span>
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