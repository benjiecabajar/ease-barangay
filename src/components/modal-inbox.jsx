import React, { useState } from 'react';
import { FaTimes, FaRegSadTear, FaPrint, FaTrash, FaCheckCircle } from 'react-icons/fa';
import '../styles/modal-inbox.css';

const InboxModal = ({ isOpen, onClose, messages, onMarkAsRead, onDelete, onClearAll, submissionStatus }) => {
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

    const handlePrint = () => {
        const printableContent = document.getElementById('printable-certificate');
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printableContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Reload to restore event listeners and state
    };

    const sortedMessages = [...messages].sort((a, b) => b.dateApproved - a.dateApproved);

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
                    <h2>{selectedMessage ? 'Message Details' : 'Inbox'}</h2>
                    <button className="close-btn" onClick={() => { setSelectedMessage(null); onClose(); }}><FaTimes size={20} /></button>
                </div>

                <div className="inbox-body">
                    {selectedMessage ? (
                        <div className="details-body">
                            <button className="back-to-list-btn" onClick={() => setSelectedMessage(null)}>
                                &larr; Back to Inbox
                            </button>
                            {selectedMessage.type === 'approved_certificate' && (
                                <div id="printable-certificate" className="certificate-paper">
                                    <div className="cert-header">
                                        <h3>Republic of the Philippines</h3>
                                        <h4>Province of Misamis Oriental</h4>
                                        <h5>MUNICIPALITY OF {selectedMessage.details?.municipality || 'VILLANUEVA'}</h5>
                                        <h1>Barangay {selectedMessage.details?.barangay || 'Poblacion 1'}</h1>
                                    </div>
                                    <div className="cert-body" style={{ textAlign: 'left' }}>
                                        <p>This is to certify that <strong>{`${selectedMessage.details?.firstName || ''} ${selectedMessage.details?.middleName || ''} ${selectedMessage.details?.lastName || ''}`.trim()}</strong>, a resident of this barangay, has been granted a <strong>{selectedMessage.certificateType}</strong> for the purpose of "{selectedMessage.purpose}".</p>
                                        <p>This certification is issued upon the request of the above-named person for whatever legal purpose it may serve.</p>
                                        <p>Issued this {new Date(selectedMessage.dateApproved).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} at the Barangay Hall.</p>
                                    </div>
                                    <div className="cert-footer">
                                        <div className="signature-line">
                                            <strong>Benjie Cabajar</strong>
                                            <span>Barangay Captain</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {selectedMessage.type === 'moderator_reply' && (
                                <div className="details-content">
                                    <h4>{selectedMessage.certificateType}</h4>
                                    <p className="message-from">From: {selectedMessage.details.firstName}</p>
                                    {selectedMessage.originalMessageBody && (
                                        <blockquote className="original-message-quote">"{selectedMessage.originalMessageBody}"</blockquote>
                                    )}
                                    <p className="message-body-text">{selectedMessage.purpose}</p>
                                </div>
                            )}
                            {selectedMessage.type === 'approved_certificate' && (
                                <div className="details-footer">
                                    <button className="print-btn" onClick={handlePrint}><FaPrint /> Print</button>
                                </div>
                            )}
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="no-items-placeholder">
                            <FaRegSadTear size={50} />
                            <h3>Your Inbox is Empty</h3>
                            <p>Approved certificate requests will appear here.</p>
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
                                        <span className="message-title">
                                            {msg.type === 'approved_certificate' ? 'Certificate Approved' : msg.certificateType}
                                        </span>
                                        <span className="message-subtitle">
                                            {msg.type === 'approved_certificate' ? `Your request for ${msg.certificateType} is ready.` : msg.purpose.substring(0, 80) + '...'}
                                        </span>
                                    </div>
                                    <span className="message-date">
                                        {new Date(msg.dateApproved).toLocaleDateString()}
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
                            <FaTrash /> Clear All
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InboxModal;