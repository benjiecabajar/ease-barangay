import React, { useState, useMemo, useEffect } from 'react';
import { FaUsers, FaUserPlus, FaGavel, FaSearch, FaUserCheck, FaUserSlash, FaUserShield, FaKey, FaEnvelope, FaReply, FaTrash, FaSpinner } from 'react-icons/fa';
import { logAuditAction } from '../utils/auditLogger';
import '../styles/user-management-modal.css';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-content user-management-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h2>{title}</h2>
                    <button onClick={onClose} className="admin-close-btn">&times;</button>
                </div>
                <div className="admin-modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

const UserManagementModal = ({ isOpen, onClose, users, setUsers, disputeReports, setDisputeReports, adminMessages, setAdminMessages, settings }) => {
    const [activeTab, setActiveTab] = useState('viewUsers');
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingState, setLoadingState] = useState({ type: null, id: null }); // For loading indicators

    // Generic loading button component
    const LoadingButton = ({ isLoading, children, ...props }) => (
        <button {...props} disabled={isLoading || props.disabled}>
            {isLoading ? <FaSpinner className="spinner" /> : children}
        </button>
    );

    // State for creating a new moderator
    const [newModMunicipality, setNewModMunicipality] = useState('');
    const [newModBarangay, setNewModBarangay] = useState('');
    const [mailboxFilter, setMailboxFilter] = useState('All'); // 'All', 'Disputes', 'Inquiries'
    const [newModUsername, setNewModUsername] = useState('');
    const [newModEmail, setNewModEmail] = useState('');
    const [newModPassword, setNewModPassword] = useState('');

    // State for replying to moderator
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');

    // This effect ensures the modal resets when it's closed or when new messages arrive.
    useEffect(() => {
        if (!isOpen) {
            // Reset internal state when modal is closed
            setActiveTab('viewUsers');
            setReplyingTo(null);
        }
    }, [isOpen, disputeReports, adminMessages]);

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const allMailboxItems = useMemo(() => {
        const disputes = disputeReports.map(item => ({ ...item, messageType: 'Dispute' }));
        const inquiries = adminMessages.map(item => ({ ...item, messageType: 'Inquiry' }));
        const allItems = [...disputes, ...inquiries].sort((a, b) => b.date - a.date);

        if (mailboxFilter === 'All') {
            return allItems;
        }
        if (mailboxFilter === 'Disputes') {
            return allItems.filter(item => item.messageType === 'Dispute');
        }
        // Default to 'Inquiries'
        return allItems.filter(item => item.messageType === 'Inquiry');
    }, [disputeReports, adminMessages, mailboxFilter]);

    const locationOptions = useMemo(() => {
        return settings?.locations || {};
    }, [settings]);

    const barangayOptions = locationOptions[newModMunicipality] || [];


    const handleUserStatusChange = (userId, newStatus) => {
        setLoadingState({ type: 'status', id: userId });
        setTimeout(() => { // Simulate API call
            const updatedUsers = users.map(user =>
                user.id === userId ? { ...user, status: newStatus } : user
            );
            setUsers(updatedUsers);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            logAuditAction('User Status Changed', { userId, newStatus }, 'admin');
            setLoadingState({ type: null, id: null });
        }, 500);
    };

    const handleUserRoleChange = (userId, newRole) => {
        setLoadingState({ type: 'role', id: userId });
        setTimeout(() => { // Simulate API call
            const updatedUsers = users.map(user =>
                user.id === userId ? { ...user, role: newRole } : user
            );
            setUsers(updatedUsers);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            logAuditAction('User Role Changed', { userId, newRole }, 'admin');
            setLoadingState({ type: null, id: null });
        }, 500);
    };

    const handleResetPassword = (userId) => {
        const newPassword = Math.random().toString(36).slice(-8);
        if (window.confirm(`Are you sure you want to reset the password for this user? The new password will be: ${newPassword}`)) {
            setLoadingState({ type: 'password', id: userId });
            setTimeout(() => { // Simulate API call
                logAuditAction('User Password Reset', { userId, newPassword }, 'admin');
                alert('Password has been reset. The new password has been logged in the audit trail for your reference.');
                setLoadingState({ type: null, id: null });
            }, 500);
        }
    };

    const handleCreateModerator = (e) => {
        e.preventDefault();
        if (!newModUsername || !newModEmail || !newModPassword || !newModBarangay) {
            alert('Please fill all fields.');
            return;
        }
        setLoadingState({ type: 'createMod' });

        const newUser = {
            id: `user-${Date.now()}`,
            username: newModUsername,
            email: newModEmail,
            password: newModPassword, // In a real app, hash this
            role: 'moderator',
            status: 'active',
            verified: true,
            dob: 'N/A',
            gender: 'N/A',
            municipality: newModMunicipality,
            barangay: newModBarangay,
        };

        setTimeout(() => { // Simulate API call
            const updatedUsers = [...users, newUser];
            setUsers(updatedUsers);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            logAuditAction('Created Moderator Account', { username: newModUsername }, 'admin');

            alert(`Moderator account for "${newModUsername}" created successfully.`);
            setNewModMunicipality('');
            setNewModBarangay('');
            setNewModUsername('');
            setNewModEmail('');
            setNewModPassword('');
            setLoadingState({ type: null, id: null });
        }, 1000);
    };

    const handleResolveDispute = (reportId) => {
        // For now, this just simulates resolving by removing the report.
        // A real implementation might change a status.
        if (window.confirm("Are you sure you want to mark this dispute as resolved? This will remove it from this view.")) {
            const updatedReports = disputeReports.filter(r => r.reportId !== reportId);
            setDisputeReports(updatedReports);
            localStorage.setItem('disputeReports', JSON.stringify(updatedReports));
            logAuditAction('Resolved Dispute Report', { reportId }, 'admin');
            alert('Dispute marked as resolved.');
        }
    };

    const handleSendReply = (e) => {
        e.preventDefault();
        if (!replyingTo || !replyMessage.trim()) return;
        setLoadingState({ type: 'reply', id: replyingTo.reportId || replyingTo.id });

        const moderatorInbox = JSON.parse(localStorage.getItem('moderatorInbox')) || [];
        const newInboxMessage = {
            id: `admin-reply-${Date.now()}`,
            subject: `Re: Your Report/Inquiry`,
            body: replyMessage,
            originalMessage: replyingTo.reason || replyingTo.issueDescription,
            date: Date.now(),
            isRead: false,
        };

        setTimeout(() => { // Simulate API call
            localStorage.setItem('moderatorInbox', JSON.stringify([newInboxMessage, ...moderatorInbox]));
            logAuditAction('Replied to Moderator', { moderatorId: replyingTo.userId, subject: newInboxMessage.subject }, 'admin');

            // Update the status of the original message/report in the admin's view
            if (replyingTo.reportId) { // It's a dispute report
                const updatedDisputes = disputeReports.map(report =>
                    report.reportId === replyingTo.reportId ? { ...report, status: 'replied' } : report
                );
                setDisputeReports(updatedDisputes);
                localStorage.setItem('disputeReports', JSON.stringify(updatedDisputes));
            } else if (replyingTo.id) { // It's an admin contact message
                const updatedAdminMessages = adminMessages.map(message =>
                    message.id === replyingTo.id ? { ...message, status: 'replied' } : message
                );
                setAdminMessages(updatedAdminMessages);
                localStorage.setItem('adminContactMessages', JSON.stringify(updatedAdminMessages));
            }

            alert('Your reply has been sent to the moderator\'s inbox.');
            setReplyingTo(null);
            setReplyMessage('');
            setLoadingState({ type: null, id: null });
        }, 1000);
    };

    const handleDeleteMessage = (itemId, isDispute) => {
        if (window.confirm("Are you sure you want to permanently delete this message?")) {
            if (isDispute) {
                const updatedDisputes = disputeReports.filter(report => report.reportId !== itemId);
                setDisputeReports(updatedDisputes);
                localStorage.setItem('disputeReports', JSON.stringify(updatedDisputes));
                logAuditAction('Admin Deleted Dispute Report Message', { reportId: itemId }, 'admin');
            } else {
                const updatedAdminMessages = adminMessages.filter(message => message.id !== itemId);
                setAdminMessages(updatedAdminMessages);
                localStorage.setItem('adminContactMessages', JSON.stringify(updatedAdminMessages));
                logAuditAction('Admin Deleted Moderator Message', { messageId: itemId }, 'admin');
            }
            alert('Message deleted.');
        }
    };

    const handleClearAllMessages = () => {
        if (window.confirm("Are you sure you want to permanently delete ALL messages in the mailbox? This action cannot be undone.")) {
            setDisputeReports([]);
            setAdminMessages([]);
            localStorage.setItem('disputeReports', JSON.stringify([]));
            localStorage.setItem('adminContactMessages', JSON.stringify([]));
            logAuditAction('Admin Cleared All Moderator Mailbox Messages', {}, 'admin');
            alert('All messages have been cleared.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="User Management">
            <div className="user-management-tabs">
                <button onClick={() => setActiveTab('viewUsers')} className={activeTab === 'viewUsers' ? 'active' : ''}><FaUsers /> View Users</button>
                <button onClick={() => setActiveTab('createModerator')} className={activeTab === 'createModerator' ? 'active' : ''}><FaUserPlus /> Create Moderator</button>                
                <button onClick={() => setActiveTab('mailbox')} className={activeTab === 'mailbox' ? 'active' : ''}><FaEnvelope /> Mailbox</button>
            </div>

            <div className="user-management-tab-content">
                {activeTab === 'viewUsers' && (
                    <div className="user-list-container">
                        <div className="user-search-bar">
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Search by username or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>
                                            <span className={`status-badge status-${user.status}`}>{user.status}</span>
                                            {user.verified && <span className="status-badge status-verified">Verified</span>}
                                        </td>
                                        <td className="user-actions">
                                            {user.status === 'active' ? (
                                                <LoadingButton
                                                    title="Suspend User"
                                                    className="action-suspend"
                                                    onClick={() => handleUserStatusChange(user.id, 'suspended')}
                                                    isLoading={loadingState.type === 'status' && loadingState.id === user.id}
                                                ><FaUserSlash /></LoadingButton>
                                            ) : (
                                                <LoadingButton
                                                    title="Reactivate User"
                                                    className="action-activate"
                                                    onClick={() => handleUserStatusChange(user.id, 'active')}
                                                    isLoading={loadingState.type === 'status' && loadingState.id === user.id}
                                                ><FaUserCheck /></LoadingButton>
                                            )}
                                            {user.role === 'resident' ? (
                                                <LoadingButton title="Promote to Moderator" onClick={() => handleUserRoleChange(user.id, 'moderator')} isLoading={loadingState.type === 'role' && loadingState.id === user.id}><FaUserShield /></LoadingButton>
                                            ) : (
                                                <LoadingButton title="Demote to Resident" className="action-demote" onClick={() => handleUserRoleChange(user.id, 'resident')} isLoading={loadingState.type === 'role' && loadingState.id === user.id}><FaUsers /></LoadingButton>
                                            )}
                                            <LoadingButton
                                                title="Reset Password"
                                                onClick={() => handleResetPassword(user.id)}
                                                isLoading={loadingState.type === 'password' && loadingState.id === user.id}
                                            ><FaKey /></LoadingButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'createModerator' && (
                    <div className="create-moderator-container">
                        <h3>Create New Moderator Account</h3>
                        <p>Directly create a new account with moderator privileges.</p>
                        <form className="create-moderator-form" onSubmit={handleCreateModerator}>
                            <div className="form-group">
                                <label htmlFor="new-mod-municipality">Municipality</label>
                                <select
                                    id="new-mod-municipality"
                                    value={newModMunicipality}
                                    onChange={(e) => { setNewModMunicipality(e.target.value); setNewModBarangay(''); }}
                                    required
                                >
                                    <option value="" disabled>Select Municipality...</option>
                                    {Object.keys(locationOptions).map(mun => <option key={mun} value={mun}>{mun}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="new-mod-barangay">Barangay</label>
                                <select
                                    id="new-mod-barangay"
                                    value={newModBarangay}
                                    onChange={(e) => setNewModBarangay(e.target.value)}
                                    disabled={!newModMunicipality}
                                    required
                                >
                                    <option value="" disabled>Select Barangay...</option>
                                    {barangayOptions.map(brgy => <option key={brgy} value={brgy}>{brgy}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="new-mod-username">Username</label>
                                <input
                                    id="new-mod-username"
                                    type="text"
                                    value={newModUsername}
                                    onChange={(e) => setNewModUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="new-mod-email">Email</label>
                                <input
                                    id="new-mod-email"
                                    type="email"
                                    value={newModEmail}
                                    onChange={(e) => setNewModEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="new-mod-password">Password</label>
                                <input
                                    id="new-mod-password"
                                    type="password"
                                    value={newModPassword}
                                    onChange={(e) => setNewModPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <LoadingButton type="submit" className="submit-btn" isLoading={loadingState.type === 'createMod'}>
                                {loadingState.type === 'createMod' ? 'Creating...' : 'Create Moderator'}
                            </LoadingButton>
                        </form>
                    </div>
                )}

                {activeTab === 'mailbox' && (
                    <div className="moderator-mailbox-container">
                        <h3>Moderator Mailbox</h3>
                        <p>Review and respond to reports and inquiries from moderators.</p>

                        <div className="mailbox-filter-controls">
                            <button onClick={() => setMailboxFilter('All')} className={mailboxFilter === 'All' ? 'active' : ''}>All ({disputeReports.length + adminMessages.length})</button>
                            <button onClick={() => setMailboxFilter('Disputes')} className={mailboxFilter === 'Disputes' ? 'active' : ''}>Dispute Reports ({disputeReports.length})</button>
                            <button onClick={() => setMailboxFilter('Inquiries')} className={mailboxFilter === 'Inquiries' ? 'active' : ''}>Inquiries ({adminMessages.length})</button>
                        </div>

                        {(allMailboxItems.length > 0 && !replyingTo) && (
                            <div className="mailbox-actions">
                                <button className="clear-all-btn" onClick={handleClearAllMessages}><FaTrash /> Clear All Messages</button>
                            </div>
                        )}

                        {replyingTo && (
                            <div className="reply-form-container">
                                <h4>Replying to {replyingTo.from || replyingTo.reporter}</h4>
                                <blockquote className="original-message-quote" style={{ backgroundColor: 'var(--admin-bg-subtle)' }}>
                                    "{replyingTo.reason || replyingTo.issueDescription}"
                                </blockquote>
                                <form onSubmit={handleSendReply}>
                                    <textarea
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        placeholder="Write your response..."
                                        required
                                    />
                                    <div className="reply-actions">
                                        <button type="button" className="cancel-reply-btn" onClick={() => setReplyingTo(null)} disabled={loadingState.type === 'reply'}>Cancel</button>
                                        <LoadingButton
                                            type="submit"
                                            className="send-reply-btn"
                                            isLoading={loadingState.type === 'reply' && loadingState.id === (replyingTo.reportId || replyingTo.id)}>
                                            {loadingState.type === 'reply' ? 'Sending...' : 'Send Reply'}
                                        </LoadingButton>
                                    </div>
                                </form>
                            </div>
                        )}
                            <div className="dispute-list" style={{ maxHeight: '50vh', overflowY: 'auto', marginTop: '15px' }}>
                                {allMailboxItems.map(item => (
                                    <div key={item.reportId || item.id} className="dispute-card">
                                        <div className="dispute-header">
                                            <span>From: <strong>{item.reporter || item.from}</strong></span>
                                            <span className="dispute-date">{new Date(item.date).toLocaleString()}</span>
                                        </div>
                                        <div className="dispute-body">
                                            {item.reportedUser && <p><strong>Subject:</strong> Dispute Report on {item.reportedUser} (Status: {item.status || 'open'})</p>}
                                            {item.issueType && <p><strong>Subject:</strong> {item.issueType} (Status: {item.status || 'open'})</p>}
                                            <p><strong>Message:</strong></p>
                                            <blockquote>{item.reason || item.issueDescription}</blockquote>
                                        </div>
                                        <div className="dispute-actions">
                                            <button className="action-btn reply" onClick={() => setReplyingTo(item)} disabled={item.status === 'replied'}>
                                                <FaReply /> Reply
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDeleteMessage(item.reportId || item.id, !!item.reportId)}>
                                                <FaTrash /> Delete
                                            </button>
                                            {item.reportedUser && (
                                                <button className="action-btn suspend" onClick={() => {
                                                    const userToSuspend = users.find(u => u.username === item.reportedUser);
                                                    if (userToSuspend) handleUserStatusChange(userToSuspend.id, 'suspended');
                                                }}>
                                                    <FaUserSlash /> Suspend User
                                                </button>
                                            )}
                                            {item.messageType === 'Dispute' && (
                                                <button className="action-btn resolve" onClick={() => handleResolveDispute(item.reportId)}>Mark as Resolved</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {(!replyingTo && allMailboxItems.length === 0) && (
                                    <div className="no-items-placeholder">
                                        <p>The moderator mailbox is empty.</p>
                                    </div>
                                )}
                            </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default UserManagementModal;