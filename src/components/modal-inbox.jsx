import React, { useState } from 'react';
import { FaTimes, FaInbox, FaRegSadTear, FaCertificate, FaPrint } from 'react-icons/fa';
import '../styles/modal-inbox.css';

const InboxModal = ({ isOpen, onClose, messages, onMarkAsRead, onDelete }) => {
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
        if (window.confirm("Are you sure you want to delete this message?")) {
            setDeletingMessageId(messageId);
            setTimeout(() => {
                onDelete(messageId);
                setDeletingMessageId(null);
            }, 500); // Match animation duration
        }
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
                                        <h5>MUNICIPALITY OF VILLANUEVA</h5>
                                        <h1>Barangay {selectedMessage.requester.barangay || 'Poblacion 1'}</h1>
                                    </div>
                                    <div className="cert-body">
                                        <p>This is to certify that <strong>{selectedMessage.requester}</strong>, a resident of this barangay, has been granted a <strong>{selectedMessage.certificateType}</strong> for the purpose of "{selectedMessage.purpose}".</p>
                                        <p>This certification is issued upon the request of the above-named person for whatever legal purpose it may serve.</p>
                                        <p>Issued this {new Date(selectedMessage.dateApproved).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} at the Barangay Hall.</p>
                                    </div>
                                    <div className="cert-footer">
                                        <div className="signature-line">
                                            <strong>JUAN DELA CRUZ</strong>
                                            <span>Barangay Captain</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="details-footer">
                                <button className="print-btn" onClick={handlePrint}><FaPrint /> Print</button>
                            </div>
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
                                        <span className="message-title">Certificate Approved</span>
                                        <span className="message-subtitle">Your request for {msg.certificateType} is ready.</span>
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
            </div>
        </div>
    );
};

export default InboxModal;