import React, { useState, useEffect } from 'react';
import { FaTimes, FaRegSadTear, FaTrash } from 'react-icons/fa';
import '../styles/modal-audit-log.css';

const renderLogDetails = (details) => {
  if (!details || Object.keys(details).length === 0) {
    return null;
  }
  return (
    <div className="log-details">
      {Object.entries(details).map(([key, value]) => (
        <div key={key} className="log-detail-item"><span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> {String(value)}</div>
      ))}
    </div>
  );
};

const AuditLogModal = ({ isOpen, onClose, role }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const logKey = `${role}_auditLogs`;
      const storedLogs = JSON.parse(localStorage.getItem(logKey)) || [];
      setLogs(storedLogs);
    }
  }, [isOpen, role]);

  const handleClearLogs = () => {
    if (window.confirm(`Are you sure you want to clear all activity logs for the ${role}? This action cannot be undone.`)) {
      const logKey = `${role}_auditLogs`;
      localStorage.removeItem(logKey);
      setLogs([]); // Clear the logs in the state to update the UI
    }
  };

  if (!isOpen) return null;

  return (
    <div className="audit-log-modal-overlay" onClick={onClose}>
      <div className="audit-log-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{role.charAt(0).toUpperCase() + role.slice(1)} Activity Log</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes size={20} />
          </button>
        </div>

        <div className="audit-log-body">
          {logs.length === 0 ? (
            <div className="no-logs-placeholder">
              <FaRegSadTear size={50} />
              <h3>No Activity Recorded</h3>
              <p>Actions you take will be logged here.</p>
            </div>
          ) : (
            <div className="audit-log-list">
              {logs.map((log) => (
                <div key={log.id} className="audit-log-item">
                  <div className="log-header">
                    <span className="log-action">{log.action}</span>
                    <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="log-meta">
                    <span className="log-user">User: {log.user}</span>
                  </div>
                  {renderLogDetails(log.details)}
                </div>
              ))}
            </div>
          )}
        </div>

        {logs.length > 0 && (
          <div className="modal-footer">
            <button className="clear-all-btn" onClick={handleClearLogs}>
              <FaTrash /> Clear All Logs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogModal;