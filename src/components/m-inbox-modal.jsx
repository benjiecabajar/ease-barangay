import React, { useState } from 'react';
import { FaTimes, FaRegSadTear, FaChevronLeft, FaEnvelopeOpen, FaTrash } from 'react-icons/fa';
import '../styles/m-inbox-modal.css';


const ModeratorInboxModal = ({ isOpen, onClose, messages, onMarkAsRead, onDelete, onClearAll }) => {
    const [selectedMessage, setSelectedMessage] = useState(null);

    if (!isOpen) return null;

    const handleSelectMessage = (message) => {
        setSelectedMessage(message);
        if (!message.isRead) {
            onMarkAsRead(message.id);
        }
    };

    const handleBackToList = () => {
        setSelectedMessage(null);
    };

    const handleDelete = (messageId) => {
        onDelete(messageId);
        handleBackToList();
    };

    const sortedMessages = [...messages].sort((a, b) => b.date - a.date);

    return (
        <div className="inbox-modal-overlay" onClick={onClose}>
            <div className="inbox-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{selectedMessage ? "Message from Admin" : "Moderator Inbox"}</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes size={20} /></button>
                </div>

                <div className="inbox-body">
                    {!selectedMessage ? (
                        // List View
                        sortedMessages.length === 0 ? (
                            <div className="no-items-placeholder">
                                <FaRegSadTear size={50} />
                                <h3>Your Inbox is Empty</h3>
                                <p>Replies from the admin will appear here.</p>
                            </div>
                        ) : (
                            <div className="message-list">
                                {sortedMessages.map(msg => (
                                    <div key={msg.id} className={`message-item ${!msg.isRead ? 'unread' : ''}`} onClick={() => handleSelectMessage(msg)}>
                                        <div className="message-icon"></div>
                                        <div className="message-summary">
                                            <span className="message-title">{msg.subject}</span>
                                            <span className="message-subtitle">{msg.body.slice(0, 50)}...</span>
                                        </div>
                                        <span className="message-date">{new Date(msg.date).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        // Detail View
                        <div className="details-body">
                            <button className="back-to-list-btn" onClick={handleBackToList}>
                                <FaChevronLeft /> Back to Inbox
                            </button>

                            <div className="message-detail-header">
                               <h3>{selectedMessage.subject}</h3>
                               <small>Received: {new Date(selectedMessage.date).toLocaleString()}</small>
                            </div>

                            <div className="message-detail-body">
                                <p>{selectedMessage.body}</p>
                            </div>

                            <div className="details-footer">
                                <button className="delete-message-btn" onClick={() => handleDelete(selectedMessage.id)}>
                                    Delete Message
                                </button>
                            </div>
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