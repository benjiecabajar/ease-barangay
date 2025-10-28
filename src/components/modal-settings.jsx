import React, { useState, useEffect } from 'react';
import { FaTimes, FaHistory, FaSave, FaCheckCircle } from "react-icons/fa";
import "../styles/modal-settings.css";
import { useTheme } from "./ThemeContext";
import AuditLogModal from "./modal-audit-log.jsx";

const SettingModal = ({ isOpen, onClose, role }) => {
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Local state to manage selections before saving
  const [localTheme, setLocalTheme] = useState(theme);
  const [localFontSize, setLocalFontSize] = useState(fontSize);

  useEffect(() => {
    if (isOpen) {
      setLocalTheme(theme);
      setLocalFontSize(fontSize);
    }
  }, [isOpen, theme, fontSize]);

  const handleSaveSettings = () => {
    setTheme(localTheme);
    setFontSize(localFontSize);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes size={20} />
          </button>
        </div>

        <AuditLogModal
          isOpen={isAuditLogOpen}
          onClose={() => setIsAuditLogOpen(false)}
          role={role}
        />

        {showConfirmation && (
          <div className="settings-save-confirmation">
            <FaCheckCircle />
            <span>Settings Saved!</span>
          </div>
        )}
        <div className="settings-body">
          <h3 className="settings-section-header">Notifications</h3>
          <div className="setting-item">
            <label htmlFor="notification-toggle">Email Notifications</label>
            <label className="switch">
              <input type="checkbox" id="notification-toggle" defaultChecked />
              <span className="slider round"></span>
            </label>
          </div>

          <h3 className="settings-section-header">Appearance & Accessibility</h3>
          <div className="setting-item">
            <label>Theme</label>
            <select value={localTheme} onChange={(e) => setLocalTheme(e.target.value)}>
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Font Size</label>
            <select
              value={localFontSize}
              onChange={(e) => setLocalFontSize(e.target.value)}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>


          <h3 className="settings-section-header">Language & Region</h3>
          <div className="setting-item">
            <label>Language</label>
            <select defaultValue="en">
              <option value="en">English</option>
              <option value="tl">Tagalog</option>
            </select>
          </div>

          <h3 className="settings-section-header">Account Security</h3>
          <button className="change-password-btn">Change Password</button>
          <button className="view-log-btn" onClick={() => setIsAuditLogOpen(true)}>
            <FaHistory /> View Activity Log
          </button>
        </div>
        <div className="settings-footer">
          <button className="save-settings-btn" onClick={handleSaveSettings}><FaSave /> Save Settings</button>
        </div>
      </div>
    </div>
  );
};

export default SettingModal;
