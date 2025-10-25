import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaCamera, FaTrash } from "react-icons/fa";
import "../styles/modal-profile.css";
import defaultAvatar from "../assets/default-avatar.png"; // Import the default avatar

const DEFAULT_PROFILE = {
  id: "U-12345",
  name: "Benjie Cabajar",
  username: "benjo",
  email: "bjc@domain.com",
  municipality: "Villanueva",
  barangay: "Poblacion",
  role: "Resident",
  birthDate: "January 1, 1990",
  joinDate: "Jan 10, 2023",
  avatar: defaultAvatar, // Use the imported local image
};

const ProfileModal = ({ isOpen, onClose, onLogout }) => {
  const [userProfile, setUserProfile] = useState(DEFAULT_PROFILE);

  const fileInputRef = useRef(null);

  // Load profile from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      } else {
        setUserProfile(DEFAULT_PROFILE); // Reset to default if nothing is saved
      }
    }
  }, [isOpen]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newProfile = { ...userProfile, avatar: reader.result };
        setUserProfile(newProfile);
        localStorage.setItem("userProfile", JSON.stringify(newProfile));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveAvatar = (e) => {
    e.stopPropagation(); // Prevent the file input from opening
    if (window.confirm("Are you sure you want to remove your profile picture?")) {
      const newProfile = { ...userProfile, avatar: defaultAvatar };
      setUserProfile(newProfile);
      localStorage.setItem("userProfile", JSON.stringify(newProfile));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>My Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes size={18} />
          </button>
        </div>

        {/* Profile Section */}
        <div className="profile-details">
          <div className="avatar-container" onClick={handleAvatarClick}>
            <img
              src={userProfile.avatar}
              alt="User Avatar"
              className="profile-avatar-large"
            />
            <div className="avatar-edit-overlay">
              <div className="overlay-action">
                <FaCamera size={20} />
                <span>Change</span>
              </div>
            </div>
          </div>
          <div className="avatar-actions">
            {userProfile.avatar !== defaultAvatar && (
              <button className="avatar-action-btn remove" onClick={handleRemoveAvatar}>Remove Profile</button>
            )}
          </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/png, image/jpeg, image/gif"
              style={{ display: "none" }}
            />
          <h3>{userProfile.name}</h3>
          <p className="username">@{userProfile.username}</p>
        </div>


        {/* Info Grid */}
        <div className="profile-info-grid">
          <div className="info-row">
            <span className="label">User ID</span>
            <span className="value">{userProfile.id}</span>
          </div>
          <div className="info-row">
            <span className="label">Role</span>
            <span className="value">{userProfile.role}</span>
          </div>
          <div className="info-row">
            <span className="label">Municipality</span>
            <span className="value">{userProfile.municipality}</span>
          </div>
          <div className="info-row">
            <span className="label">Barangay</span>
            <span className="value">{userProfile.barangay}</span>
          </div>
          <div className="info-row">
            <span className="label">Birth Date</span>
            <span className="value">{userProfile.birthDate}</span>
          </div>
          <div className="info-row">
            <span className="label">Email</span>
            <span className="value">{userProfile.email}</span>
          </div>
          <div className="info-row">
            <span className="label">Joined</span>
            <span className="value">{userProfile.joinDate}</span>
          </div>
        </div>

        {/* Logout */}
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
