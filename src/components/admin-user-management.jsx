import React, { useState, useMemo } from 'react';
import { FaUsers, FaUserPlus, FaGavel, FaSearch, FaUserCheck, FaUserSlash, FaUserShield, FaKey } from 'react-icons/fa';
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

const UserManagementModal = ({ isOpen, onClose, users, setUsers, disputeReports }) => {
    const [activeTab, setActiveTab] = useState('viewUsers');
    const [searchTerm, setSearchTerm] = useState('');

    // State for creating a new moderator
    const [newModUsername, setNewModUsername] = useState('');
    const [newModEmail, setNewModEmail] = useState('');
    const [newModPassword, setNewModPassword] = useState('');

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const handleUserStatusChange = (userId, newStatus) => {
        const updatedUsers = users.map(user =>
            user.id === userId ? { ...user, status: newStatus } : user
        );
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        logAuditAction('User Status Changed', { userId, newStatus }, 'admin');
    };

    const handleUserRoleChange = (userId, newRole) => {
        const updatedUsers = users.map(user =>
            user.id === userId ? { ...user, role: newRole } : user
        );
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        logAuditAction('User Role Changed', { userId, newRole }, 'admin');
    };

    const handleResetPassword = (userId) => {
        const newPassword = Math.random().toString(36).slice(-8);
        if (window.confirm(`Are you sure you want to reset the password for this user? The new password will be: ${newPassword}`)) {
            // In a real app, you'd hash this and save it to the DB.
            // For this simulation, we'll just log it.
            logAuditAction('User Password Reset', { userId, newPassword }, 'admin');
            alert('Password has been reset. The new password has been logged in the audit trail for your reference.');
        }
    };

    const handleCreateModerator = (e) => {
        e.preventDefault();
        if (!newModUsername || !newModEmail || !newModPassword) {
            alert('Please fill all fields.');
            return;
        }

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
            barangay: 'N/A',
        };

        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        logAuditAction('Created Moderator Account', { username: newModUsername }, 'admin');

        alert(`Moderator account for "${newModUsername}" created successfully.`);
        setNewModUsername('');
        setNewModEmail('');
        setNewModPassword('');
    };

    const handleResolveDispute = (reportId) => {
        // For now, this just simulates resolving by removing the report.
        // A real implementation might change a status.
        if (window.confirm("Are you sure you want to mark this dispute as resolved? This will remove it from the list.")) {
            const updatedReports = disputeReports.filter(r => r.reportId !== reportId);
            // In a real app, you'd update the state that holds these reports.
            // For now, we'll just update localStorage.
            localStorage.setItem('disputeReports', JSON.stringify(updatedReports));
            logAuditAction('Resolved Dispute Report', { reportId }, 'admin');
            // To see the change, the admin would need to reopen the modal.
            // A better implementation would pass `setDisputeReports` as a prop.
            alert('Dispute marked as resolved.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="User Management Dashboard">
            <div className="user-management-tabs">
                <button onClick={() => setActiveTab('viewUsers')} className={activeTab === 'viewUsers' ? 'active' : ''}><FaUsers /> View Users</button>
                <button onClick={() => setActiveTab('createModerator')} className={activeTab === 'createModerator' ? 'active' : ''}><FaUserPlus /> Create Moderator</button>
                <button onClick={() => setActiveTab('disputes')} className={activeTab === 'disputes' ? 'active' : ''}><FaGavel /> Dispute Resolution</button>
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
                                            {!user.verified && (
                                                <button title="Manually Verify" onClick={() => handleUserStatusChange(user.id, 'verified')}><FaUserCheck /></button>
                                            )}
                                            {user.status === 'active' ? (
                                                <button title="Suspend User" className="action-suspend" onClick={() => handleUserStatusChange(user.id, 'suspended')}><FaUserSlash /></button>
                                            ) : (
                                                <button title="Reactivate User" className="action-activate" onClick={() => handleUserStatusChange(user.id, 'active')}><FaUserCheck /></button>
                                            )}
                                            {user.role === 'resident' ? (
                                                <button title="Promote to Moderator" onClick={() => handleUserRoleChange(user.id, 'moderator')}><FaUserShield /></button>
                                            ) : (
                                                <button title="Demote to Resident" className="action-demote" onClick={() => handleUserRoleChange(user.id, 'resident')}><FaUsers /></button>
                                            )}
                                            <button title="Reset Password" onClick={() => handleResetPassword(user.id)}><FaKey /></button>
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
                            <button type="submit" className="submit-btn">Create Moderator</button>
                        </form>
                    </div>
                )}

                {activeTab === 'disputes' && (
                    <div className="dispute-resolution-container">
                        <h3>Dispute Reports from Moderators</h3>
                        <p>Review reports filed by moderators against residents for policy violations.</p>
                        <div className="dispute-list">
                            {disputeReports.length > 0 ? disputeReports.map(report => (
                                <div key={report.reportId} className="dispute-card">
                                    <div className="dispute-header">
                                        <span>Reported by: <strong>{report.reporter}</strong></span>
                                        <span className="dispute-date">{new Date(report.date).toLocaleString()}</span>
                                    </div>
                                    <div className="dispute-body">
                                        <p><strong>Reported Resident:</strong> {report.reportedUser}</p>
                                        <p><strong>Reason:</strong></p>
                                        <blockquote>{report.reason}</blockquote>
                                    </div>
                                    <div className="dispute-actions">
                                        <button className="action-btn suspend" onClick={() => {
                                            const userToSuspend = users.find(u => u.username === report.reportedUser);
                                            if (userToSuspend) {
                                                handleUserStatusChange(userToSuspend.id, 'suspended');
                                                alert(`User ${report.reportedUser} has been suspended.`);
                                            } else {
                                                alert(`User ${report.reportedUser} not found.`);
                                            }
                                        }}>
                                            <FaUserSlash /> Suspend User
                                        </button>
                                        <button className="action-btn resolve" onClick={() => handleResolveDispute(report.reportId)}>
                                            Mark as Resolved
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="no-items-placeholder">
                                    <p>No active dispute reports.</p>
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