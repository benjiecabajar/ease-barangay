import React, { useState } from 'react';
import { FaTimes, FaRegSadTear, FaTrash, FaCheckCircle } from 'react-icons/fa';
import '../styles/m-inbox-modal.css'; // Using a separate CSS file for moderator-specific styles

const ModeratorInboxModal = ({ isOpen, onClose, messages, onMarkAsRead, onDelete, onClearAll, submissionStatus }) => {
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [deletingMessageId, setDeletingMessageId] = useState(null);

    if (!isOpen) return null;

    const handleMessageClick = (message) => {
        setSelectedMessage(message);
        if (!message.isRead) {
            onMarkAsRead(message.id);
        }
    };

    const handleDeleteClick = (e, messageId) => {
        e.stopPropagation(); // Prevent message from being selected
        setDeletingMessageId(messageId);
        setTimeout(() => {
            onDelete(messageId);
            setDeletingMessageId(null);
        }, 500); // Match animation duration
    };

    const sortedMessages = [...messages].sort((a, b) => b.date - a.date);

    return (
        <div className="inbox-modal-overlay" onClick={() => { setSelectedMessage(null); onClose(); }}>
            <div className="inbox-modal-content" onClick={(e) => e.stopPropagation()}>
                {submissionStatus && (
                    <div className="submission-overlay">
                        {submissionStatus === 'clearing' && (
                            <>
                                <div className="spinner"></div>
                                <p>Clearing Inbox...</p>
                            </>
                        )}
                        {submissionStatus === 'success' && (
                            <>
                                <FaCheckCircle className="success-icon" size={60} />
                                <p>Inbox Cleared!</p>
                            </>
                        )}
                    </div>
                )}

                <div className="modal-header">
                    <h2>{selectedMessage ? 'Message Details' : 'Moderator Inbox'}</h2>
                    <button className="close-btn" onClick={() => { setSelectedMessage(null); onClose(); }}><FaTimes size={20} /></button>
                </div>

                <div className="inbox-body">
                    {selectedMessage ? (
                        <div className="details-body">
                            <button className="back-to-list-btn" onClick={() => setSelectedMessage(null)}>
                                &larr; Back to Inbox
                            </button>
                            <div className="details-content">
                                <h4>{selectedMessage.subject}</h4>
                                <p className="message-body-text">{selectedMessage.body}</p>
                                <span className="details-date">
                                    Received: {new Date(selectedMessage.date).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="no-items-placeholder">
                            <FaRegSadTear size={50} />
                            <h3>Your Inbox is Empty</h3>
                            <p>Messages from residents and system notifications will appear here.</p>
                        </div>
                    ) : (
                        <div className="message-list">
                            {sortedMessages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`message-item ${msg.isRead ? '' : 'unread'} ${deletingMessageId === msg.id ? 'deleting' : ''}`}
                                    onClick={() => handleMessageClick(msg)}
                                >
                                    <div className="message-icon"></div>
                                    <div className="message-summary">
                                        <span className="message-title">{msg.subject}</span>
                                        <span className="message-subtitle">{msg.body.substring(0, 80)}...</span>
                                    </div>
                                    <span className="message-date">
                                        {new Date(msg.date).toLocaleDateString()}
                                    </span>
                                    <button
                                        className="message-delete-btn"
                                        onClick={(e) => handleDeleteClick(e, msg.id)}
                                        title="Delete message"
                                        disabled={deletingMessageId}
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {!selectedMessage && messages.length > 0 && (
                    <div className="modal-footer">
                        <button className="clear-all-btn" onClick={onClearAll}>
                            <FaTrash /> Clear All Messages
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModeratorInboxModal;