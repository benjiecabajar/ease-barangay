import React, { useState, useEffect } from "react";
// 1. IMPORT the image file
// Adjust the path to where your logo.png is actually located
import logoImage from "../assets/logo.png"; 
import defaultAvatar from "../assets/default-avatar.png";
import "../styles/header.css";

// All the unnecessary and problematic icon imports have been removed.

const Header = ({ logoText = "EaseBarangay" }) => {
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [username, setUsername] = useState("{User}");

  useEffect(() => {
    const loadProfile = () => {
      const savedProfile = localStorage.getItem("userProfile");
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        setUsername(profile.username || "{User}");
        setAvatar(profile.avatar || defaultAvatar);
      }
    };

    loadProfile();

    // Listen for storage changes to update the avatar if it's changed in another tab/component
    window.addEventListener('storage', loadProfile);
    return () => window.removeEventListener('storage', loadProfile);
  }, []);

    return (
        // Top bar
        <header className="top-bar">
            <div className="logo">
                {/* Image added next to the logoText */}
                <img src={logoImage} alt="EaseBarangay Logo" className="logo-icon" />
                {logoText}
            </div>
            <h2 className="updates-title"></h2>
            <div className="user-info">
                <span className="username">{username}</span> 
                <img
                    src={avatar}
                    alt="User avatar"
                    className="avatar"
                />
            </div>
        </header>
    );
};

export default Header;