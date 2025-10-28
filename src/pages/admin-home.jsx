import React, { useState, useEffect, useMemo } from "react";
import "react-calendar/dist/Calendar.css";
import "../styles/admin-home.css";
import {
    FaBullhorn, FaHistory, FaTrash, FaTimes, FaFilter, FaSortAmountDown, FaSortAmountUp, FaCog, FaUsers
} from "react-icons/fa"; // Added FaCog, FaUsers

import { logAuditAction } from "../utils/auditLogger";
import UserManagementModal from "../components/admin-user-management.jsx";
import SystemSettingsModal from "../components/admin-system-settings.jsx";
import AdminAnalyticsDashboard from "../components/admin-analytics-dashboard.jsx";
import Header from "../components/header"; // Assuming a shared Header component

// A simple modal component structure
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h2>{title}</h2>
                    <button onClick={onClose} className="admin-close-btn"><FaTimes /></button>
                </div>
                <div className="admin-modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

function AdminHome() {
//1. Super-Moderation & Content Oversight
//Global Content Management: Ability to edit or delete any announcement or post made by any moderator.
//Audit Trail Viewer: A dedicated interface to view all actions logged by both moderators and residents (e.g., post creation, report status updates, user logins). This is crucial for accountability.
//System-Wide Broadcasts: Send high-priority messages that appear as a banner or special notification to all users (residents and moderators).


    const [posts, setPosts] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [broadcasts, setBroadcasts] = useState([]);
    const [users, setUsers] = useState([]);
    const [settings, setSettings] = useState({});
    const [reports, setReports] = useState([]);
    const [certificationRequests, setCertificationRequests] = useState([]);
    const [disputeReports, setDisputeReports] = useState([]);
    const [adminMessages, setAdminMessages] = useState([]);

    // Modal states
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
    const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    
    // Audit Log filters
    const [logSearchTerm, setLogSearchTerm] = useState('');
    const [logFilterType, setLogFilterType] = useState('All');
    const [logSortOrder, setLogSortOrder] = useState('newest');

    // Pagination state for audit logs
    const [auditCurrentPage, setAuditCurrentPage] = useState(1);
    const logsPerPage = 15;
    const [jumpToPageInput, setJumpToPageInput] = useState("");

    const [sortOrder, setSortOrder] = useState('newest');
    const [filterCategory, setFilterCategory] = useState('All');

    // Post search state
    const [postSearchTerm, setPostSearchTerm] = useState('');

    // Broadcast form state
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastType, setBroadcastType] = useState('info');

    const POST_CATEGORIES = [
        'General', 'Event', 'Health Advisory', 'Safety Alert', 
        'Community Program', 'Traffic Update', 'Weather Alert', 
        'Maintenance Notice', 'Other'
    ];

    const getCategoryClass = (categoryName) => {
        if (!categoryName) return 'category-general';
        return `category-${categoryName.toLowerCase().replace(/\s+/g, '-')}`;
    };



    // Load data from localStorage on component mount
useEffect(() => { 
        const loadData = () => {
            const loadedPosts = JSON.parse(localStorage.getItem("announcements")) || [];        
            const adminLogs = JSON.parse(localStorage.getItem("admin_auditLogs")) || [];
            const moderatorLogs = JSON.parse(localStorage.getItem("moderator_auditLogs")) || [];
            const residentLogs = JSON.parse(localStorage.getItem("resident_auditLogs")) || [];
            const loadedLogs = [...adminLogs, ...moderatorLogs, ...residentLogs].sort((a, b) => b.timestamp - a.timestamp);
    
            const loadedBroadcasts = JSON.parse(localStorage.getItem("systemBroadcasts")) || [];        
            const loadedUsers = JSON.parse(localStorage.getItem("users")) || [];
            let loadedSettings = JSON.parse(localStorage.getItem("system_settings"));
    
            // If no settings exist, create and save default ones
            if (!loadedSettings) {
                loadedSettings = {
                    locations: {
                        "Villanueva": ["Balacanas", "Dayawan", "Imelda", "Katipunan", "Kimaya", "Looc", "Poblacion 1", "Poblacion 2", "Poblacion 3", "San Martin", "Tambobong"],
                        "Tagoloan": ["Baluarte", "Casinglot", "Mohon", "Natumolan", "Rosario", "Santa Ana", "Santa Cruz", "Sugbongcogon"]
                    },
                    announcementCategories: ['General', 'Event', 'Health Advisory', 'Safety Alert', 'Community Program', 'Traffic Update', 'Weather Alert', 'Maintenance Notice', 'Other'],
                    reportCategories: ['General Maintenance', 'Safety Hazard', 'Noise Complaint', 'Pest Control', 'Facilities Issue']
                };
                localStorage.setItem('system_settings', JSON.stringify(loadedSettings));
                logAuditAction('Initialized Default System Settings', {}, 'system');
            }
    
            const loadedReports = JSON.parse(localStorage.getItem("userReports")) || [];
            const loadedCerts = JSON.parse(localStorage.getItem("certificationRequests")) || [];
            const loadedDisputes = JSON.parse(localStorage.getItem("disputeReports")) || [];
            const loadedAdminMessages = JSON.parse(localStorage.getItem("adminContactMessages")) || [];
    
            setPosts(loadedPosts.sort((a, b) => new Date(b.date) - new Date(a.date))); // Default sort: newest first
            setUsers(loadedUsers);
            setAuditLogs(loadedLogs);
            setSettings(loadedSettings);
            setAdminMessages(loadedAdminMessages);
            setCertificationRequests(loadedCerts);
            setDisputeReports(loadedDisputes);
            setReports(loadedReports);
            setBroadcasts(loadedBroadcasts);
        };

        loadData(); // Initial load

        // Listen for changes from other tabs
        const handleStorageChange = (e) => {
            // Check if any of the relevant keys have changed
            if (['disputeReports', 'adminContactMessages', 'users', 'announcements', 'userReports', 'systemBroadcasts', 'system_settings'].includes(e.key) || !e.key) {
                loadData();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []); // This useEffect runs once on initial load

    const newModeratorMessageCount = useMemo(() => {
        const openDisputes = disputeReports.filter(report => report.status === 'open').length;
        const openMessages = adminMessages.filter(message => message.status === 'open').length;
        return openDisputes + openMessages;
    }, [disputeReports, adminMessages]);

    // --- Super-Moderation: Content Management --- 
    const handleDeletePost = (postId) => {
        if (window.confirm("Are you sure you want to permanently delete this post? This action cannot be undone.")) {
            const updatedPosts = posts.filter(p => p.id !== postId);
            setPosts(updatedPosts);
            localStorage.setItem("announcements", JSON.stringify(updatedPosts));
            logAuditAction('Admin Deleted Post', { postId }, 'admin');
        }
    };

    // --- Post Feed Logic ---
    const processedPosts = useMemo(() => {
        let filtered = posts;

        // Filter by category
        if (filterCategory !== 'All') {
            filtered = filtered.filter(post => post.category === filterCategory);
        }

        // Filter by search term (post ID)
        if (postSearchTerm.trim()) {
            filtered = filtered.filter(post => String(post.id).includes(postSearchTerm.trim()));
        }

        return filtered.sort((a, b) => {
            return sortOrder === 'newest' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date);
        });
    }, [posts, postSearchTerm, filterCategory, sortOrder]);

    // --- Audit Trail Logic ---
    const filteredLogs = useMemo(() => {
        return auditLogs
            .filter(log => {
                const searchTerm = logSearchTerm.toLowerCase();
                const searchTermMatch = (log.actor?.toLowerCase() || '').includes(searchTerm) ||
                                      (log.userId?.toLowerCase() || '').includes(searchTerm);
                const typeMatch = logFilterType === 'All' || (log.action?.toLowerCase() || '').includes(logFilterType.toLowerCase());
                return searchTermMatch && typeMatch;
            })
            .sort((a, b) => {
                return logSortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
            });
    }, [auditLogs, logSearchTerm, logFilterType, logSortOrder]);

    // --- Pagination Logic for Audit Trail ---
    const paginatedLogs = useMemo(() => {
        const indexOfLastLog = auditCurrentPage * logsPerPage;
        const indexOfFirstLog = indexOfLastLog - logsPerPage;
        return filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
    }, [filteredLogs, auditCurrentPage, logsPerPage]);

    const handleJumpToPage = (e) => {
        e.preventDefault();
        const pageNumber = parseInt(jumpToPageInput, 10);
        const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
        if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
            setAuditCurrentPage(pageNumber);
        } else {
            alert(`Please enter a valid page number between 1 and ${totalPages}.`);
        }
        setJumpToPageInput(""); // Clear input after attempting to jump
    };

    const logActionTypes = useMemo(() => ['All', ...new Set(auditLogs.map(log => log.action.split(' ')[0]))], [auditLogs]);

    // --- System-Wide Broadcasts Logic ---
    const handleSendBroadcast = () => {
        if (!broadcastMessage.trim()) {
            alert("Broadcast message cannot be empty.");
            return;
        }
        const newBroadcast = {
            id: Date.now(),
            message: broadcastMessage,
            type: broadcastType,
            isActive: true,
            createdAt: Date.now(),
        };
        const updatedBroadcasts = [newBroadcast, ...broadcasts];
        setBroadcasts(updatedBroadcasts);
        localStorage.setItem("systemBroadcasts", JSON.stringify(updatedBroadcasts));
        logAuditAction('Admin Sent Broadcast', { message: broadcastMessage, type: broadcastType }, 'admin');
        setBroadcastMessage('');
        setBroadcastType('info');
    };

    const handleToggleBroadcast = (id) => {
        const updatedBroadcasts = broadcasts.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b);
        setBroadcasts(updatedBroadcasts);
        localStorage.setItem("systemBroadcasts", JSON.stringify(updatedBroadcasts));
        const targetBroadcast = updatedBroadcasts.find(b => b.id === id);
        logAuditAction('Admin Toggled Broadcast', { broadcastId: id, status: targetBroadcast.isActive ? 'active' : 'inactive' }, 'admin');
    };

    const handleDeleteBroadcast = (id) => {
        if (window.confirm("Are you sure you want to delete this broadcast?")) {
            const updatedBroadcasts = broadcasts.filter(b => b.id !== id);
            setBroadcasts(updatedBroadcasts);
           localStorage.setItem("systemBroadcasts", JSON.stringify(updatedBroadcasts));
            logAuditAction('Admin Deleted Broadcast', { broadcastId: id }, 'admin');
        }
    };

    return (
        
        <div className="admin-page">
            <Header />
            <div className="admin-content">
                <main className="admin-main-content">
                    <AdminAnalyticsDashboard
                        users={users}
                        auditLogs={auditLogs}
                        reports={reports}
                        certificationRequests={certificationRequests}
                        settings={settings}
                    />
                    <h1>Global Content Feed</h1>
                    <div className="admin-feed-controls">
                        <input
                            type="text"
                            placeholder="Search by Post ID..."
                            value={postSearchTerm}
                            onChange={e => setPostSearchTerm(e.target.value)}
                        />
                        <select id="sort-posts" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} title="Sort posts">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                        <select id="filter-category" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} title="Filter by category">
                            <option value="All">All Categories</option>
                            {POST_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="post-list">
                        {processedPosts.length > 0 ? processedPosts.map(post => (
                            <div key={post.id} className="admin-post-card">
                                <div className="post-card-header">
                                    <img src={post.authorAvatar} alt="author" className="author-avatar" />
                                    <div>
                                        <span className="author-name">{post.author}</span>
                                        <span className="post-time">
                                            {post.category && (
                                                <span className={`post-category-badge ${getCategoryClass(post.category)}`}>{post.category}</span>
                                            )}
                                            {new Date(post.date).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="post-actions">
                                        <button className="action-btn delete-btn" title="Delete Post" onClick={() => handleDeletePost(post.id)}><FaTrash /></button>
                                    </div>
                                </div>
                                {post.title && <h3 className="post-title">{post.title}</h3>}
                                <p className="post-description">{post.description}</p>
                            </div>
                        )) : <p>No announcements found.</p>}
                    </div>
                </main>

                <aside className="admin-right-panel">
                    <div className="admin-widget">
                        <h4><FaHistory /> Audit Trail</h4>
                        <p>Review all actions taken by users and moderators across the system.</p>
                        <button onClick={() => setIsAuditModalOpen(true)}>Open Audit Viewer</button>
                    </div>
                    <div className="admin-widget">
                        <h4><FaBullhorn /> System Broadcasts</h4>
                        <p>Send or manage high-priority messages for all users.</p>
                        <button onClick={() => setIsBroadcastModalOpen(true)}>Manage Broadcasts</button>
                    </div>
                    <div className="admin-widget">
                        <h4 className="widget-title-container">
                            <span><FaUsers /> User Management</span>
                            {newModeratorMessageCount > 0 && <span className="widget-badge">{newModeratorMessageCount}</span>}
                        </h4>
                        <p>Control user accounts, manage roles, and resolve disputes.</p>
                        <button onClick={() => setIsUserManagementModalOpen(true)}>Open User Dashboard</button>
                    </div>
                    <div className="admin-widget">
                        <h4><FaCog /> System Configuration</h4>
                        <p>Manage application settings, data, and integrations.</p>
                        <button onClick={() => setIsSettingsModalOpen(true)}>Open System Settings</button>
                    </div>
                </aside>
            </div>

            {/* Audit Trail Modal */}
            <Modal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} title="Audit Trail">
                <div className="audit-filters">
                    <input type="text" placeholder="Search by User Name or ID..." value={logSearchTerm} onChange={e => setLogSearchTerm(e.target.value)} />
                    <select value={logFilterType} onChange={e => setLogFilterType(e.target.value)}>
                        {logActionTypes.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <button onClick={() => setLogSortOrder(logSortOrder === 'newest' ? 'oldest' : 'newest')}>
                        {logSortOrder === 'newest' ? <FaSortAmountDown /> : <FaSortAmountUp />}
                        {logSortOrder === 'newest' ? ' Newest First' : ' Oldest First'}
                    </button>
                </div>
                <ul className="audit-log-list">
                    {paginatedLogs.map(log => (
                        <li key={log.id} className="log-item">
                            <div className="log-main-info">
                                <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
                                <span className="log-actor">({log.userId} / <strong>{log.actor}</strong>)</span>
                                <span className="log-action">{log.action}</span>
                            </div>
                            <details className="log-details-container">
                                <summary>Details</summary>
                                <pre>{JSON.stringify(log.details, null, 2)}</pre>
                            </details>
                        </li>
                    ))}
                </ul>
                {filteredLogs.length > logsPerPage && (
                    <div className="pagination-controls">
                        <button 
                            onClick={() => setAuditCurrentPage(prev => Math.max(prev - 1, 1))} 
                            disabled={auditCurrentPage === 1}
                        >
                            Previous
                        </button>
                        <span>Page {auditCurrentPage} of {Math.ceil(filteredLogs.length / logsPerPage)}</span>
                        <button 
                            onClick={() => setAuditCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredLogs.length / logsPerPage)))} 
                            disabled={auditCurrentPage === Math.ceil(filteredLogs.length / logsPerPage)}
                        >
                            Next
                        </button>
                        <form onSubmit={handleJumpToPage} className="jump-to-page">
                            <input
                                type="number"
                                value={jumpToPageInput}
                                onChange={(e) => setJumpToPageInput(e.target.value)}
                                placeholder="Page..."
                                min="1"
                                max={Math.ceil(filteredLogs.length / logsPerPage)}
                            />
                            <button type="submit">Go</button>
                        </form>
                    </div>
                )}
            </Modal>

            {/* Broadcast Modal */}
            <Modal isOpen={isBroadcastModalOpen} onClose={() => setIsBroadcastModalOpen(false)} title="System Broadcasts">
                <div className="broadcast-form">
                    <h4>Create New Broadcast</h4>
                    <textarea
                        placeholder="Enter broadcast message..."
                        value={broadcastMessage}
                        onChange={e => setBroadcastMessage(e.target.value)}
                    />
                    <select value={broadcastType} onChange={e => setBroadcastType(e.target.value)}>
                        <option value="info">Info (Blue)</option>
                        <option value="warning">Warning (Yellow)</option>
                        <option value="critical">Critical (Red)</option>
                    </select>
                    <button onClick={handleSendBroadcast}>Send Broadcast</button>
                </div>
                <div className="broadcast-list">
                    <h4>Active & Past Broadcasts</h4>
                    {broadcasts.length > 0 ? broadcasts.map(b => (
                        <div key={b.id} className={`broadcast-item type-${b.type} ${b.isActive ? 'active' : 'inactive'}`}>
                            <p>{b.message}</p>
                            <div className="broadcast-actions">
                                <small>{new Date(b.createdAt).toLocaleString()}</small>
                                <button onClick={() => handleToggleBroadcast(b.id)}>{b.isActive ? 'Deactivate' : 'Activate'}</button>
                                <button className="delete" onClick={() => handleDeleteBroadcast(b.id)}>Delete</button>
                            </div>
                        </div>
                    )) : <p>No broadcasts have been sent.</p>}
                </div>
            </Modal>

            <UserManagementModal
                isOpen={isUserManagementModalOpen}
                onClose={() => setIsUserManagementModalOpen(false)}
                users={users}
                setUsers={setUsers}
                disputeReports={disputeReports}
                setDisputeReports={setDisputeReports}
                adminMessages={adminMessages}
                setAdminMessages={setAdminMessages}
                settings={settings}
            />

            <SystemSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                settings={settings}
                setSettings={setSettings}
            />
        </div>
    );
}
export default AdminHome;