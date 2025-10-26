import React, { useState, useEffect, useMemo, useCallback } from "react";
import Calendar from "react-calendar"; 
import { useNavigate } from "react-router-dom";
import "react-calendar/dist/Calendar.css";
import "../styles/moderator-home.css";
// Import only icons needed in ModeratorHome (sidebar, posts, modals, etc.)
import { FaUser, FaPlus, FaFileAlt, FaChartBar, FaInfoCircle, FaCog, FaTimes, FaChevronLeft, FaChevronRight, FaEllipsisH, FaBell, FaEdit, FaTrash, FaHeadset, FaSyncAlt, FaCheckCircle, FaInbox, FaExclamationTriangle } from "react-icons/fa";
import { MdOutlineAssignment } from "react-icons/md"; 
import ReviewCertsModal from "../components/m-review-certs.jsx";
import ReportUserModal from "../components/m-report-user-modal.jsx";
import SupportModal from "../components/m-support-modal.jsx";
import AnalyticsDashboard from "../components/m-analytics-dashboard.jsx";
import "../styles/m-create-post.css";
import ModeratorInboxModal from "../components/m-inbox-modal.jsx";
import ReviewReportModal from "../components/m-review-report.jsx"; // Import the new modal
import PostModal from "../components/m-create-post.jsx";
import NotificationModal from "../components/modal-notification.jsx";
import EventModal from "../components/m-event-modal.jsx";
// Import the new Header component
import Header from "../components/header.jsx"; 
import ProfileModal from "../components/modal-profile.jsx";
import SettingModal from "../components/modal-settings.jsx";
import { ThemeProvider } from "../components/ThemeContext";
import { logAuditAction } from "../utils/auditLogger.js";
import { checkEventStatus } from "../utils/eventUtils.js";


// =========================================================
// Comment Section Component
// Hides comments beyond the last 3 automatically on load
// =========================================================
const CommentSection = ({ postId, comments, handleAddComment, onEditComment, onDeleteComment, onReportComment }) => {
    const [newComment, setNewComment] = useState("");
    const [showAllComments, setShowAllComments] = useState(false); 

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            handleAddComment(postId, newComment);
            setNewComment("");
            // Do NOT auto-expand on new comment; keep default collapsed
        }
    };

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [openMenuCommentId, setOpenMenuCommentId] = useState(null);
    const [editedText, setEditedText] = useState('');

    const handleEditClick = (comment) => {
        setEditingCommentId(comment.id);
        setEditedText(comment.text);
    };

    const handleCancelEdit = () => {
        setOpenMenuCommentId(null);
        setEditingCommentId(null);
        setEditedText('');
    };

    const handleSaveEdit = () => {
        onEditComment(postId, editingCommentId, editedText);
        handleCancelEdit();
        setOpenMenuCommentId(null);
    };

    // Decide which comments to display
    const commentsToDisplay = showAllComments 
        ? comments 
        : comments.slice(-3);

    const hasMoreComments = comments.length > 3;

    return (
        <div className="comment-section">
            <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', marginTop: '15px' }}>
                Comments ({comments.length})
            </h5>

            {/* Show "View more" if more than 3 comments and not expanded */}
            {hasMoreComments && !showAllComments && (
                <button 
                    onClick={() => setShowAllComments(true)}
                    className="view-more-comments-btn show"
                    style={{ color: '#2563eb' }}
                >
                    View more {comments.length - 3} comments...
                </button>
            )}

            {/* Comments */}
            <div className="comments-list">
                {commentsToDisplay.map((comment, index) => (
                    <div 
                        key={comment.id || index} 
                        className="comment" 
                    >
                        <img 
                            src={comment.authorAvatar} 
                            alt="avatar" 
                            style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                            {editingCommentId === comment.id ? (
                                <div className="comment-edit-form">
                                    <textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} />
                                    <div className="comment-edit-actions">
                                        <button onClick={handleSaveEdit}>Save</button>
                                        <button onClick={handleCancelEdit}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                              <div className="comment-body">
                                <div className="comment-text-content">
                                  <span style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>{comment.author}</span>              
                                  <span className="comment-date">
                                    {new Date(comment.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                  </span>
                                  <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.4', color: '#374151' }}>{comment.text}</p>
                                </div>
                                <div className="comment-options-container">
                                  <button className="comment-options-btn" onClick={() => setOpenMenuCommentId(openMenuCommentId === comment.id ? null : comment.id)}>
                                    <FaEllipsisH />
                                  </button>
                                  {openMenuCommentId === comment.id && (
                                    comment.author === 'Community Moderator' ? (
                                      <div className="comment-actions-menu">
                                        <button onClick={() => { handleEditClick(comment); setOpenMenuCommentId(null); }}>
                                          <FaEdit /> Edit
                                        </button>
                                        <button onClick={() => { onDeleteComment(postId, comment.id); setOpenMenuCommentId(null); }} className="delete">
                                          <FaTrash /> Delete
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="comment-actions-menu">
                                        <button onClick={() => { onReportComment(comment); setOpenMenuCommentId(null); }} className="report">
                                          <FaExclamationTriangle /> Report
                                        </button>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                    </div>
                ))}
            </div>

            {/* Hide button when expanded */}
            {hasMoreComments && showAllComments && (
                <button 
                    onClick={() => setShowAllComments(false)}
                    className="view-more-comments-btn hide"
                    style={{ color: '#6b7280' }}
                >
                    Hide comments
                </button>
            )}

            {/* Add comment form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{
                        flexGrow: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                    }}
                />
                <button 
                    type="submit" 
                    disabled={!newComment.trim()}
                    style={{
                        padding: '8px 15px',
                        borderRadius: '8px',
                        border: 'none',
                        background: newComment.trim() ? '#2563eb' : '#9ca3af',
                        color: 'white',
                        fontWeight: '600',
                        cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                    }}
                >
                    Post
                </button>
            </form>
        </div>
    );
};

// =========================================================
// Main Content Feed Component
// =========================================================
const MainContentFeed = ({ posts, handleDeletePost, handleEditClick, renderPostImages, openImageModal, handleAddComment, openMenuPostId, setOpenMenuPostId, handleEditComment, handleDeleteComment, handleReportComment, getCategoryClass }) => {
    return (
        <div className="feed-content">
            {/* Posts Feed - Social Media Style */}
            {posts.map((post) => (
                <div className="update-card" key={post.id}>
                    <div className="post-header">
                        <img src={post.authorAvatar} alt="n/a" className="author-avatar" />
                        <div className="post-info">
                            <span className="author-name">{post.author}</span>
                            <span className="post-time">
                                {post.category && (
                                    <span className={`post-category-badge ${getCategoryClass(post.category)}`}>{post.category}</span>
                                )}
                              {new Date(post.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                        </div>
                            <div className="post-actions-container">
                                <button className="options-btn" onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)}>
                                    <FaEllipsisH size={18} />
                                </button>
                                {openMenuPostId === post.id && (
                                    <div className="post-actions-menu">
                                        <button onClick={() => { handleEditClick(post); setOpenMenuPostId(null); }}>
                                            <FaEdit /> Edit
                                        </button>
                                        <button onClick={() => { handleDeletePost(post.id); setOpenMenuPostId(null); }} className="delete">
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                    </div>
                    
                    {post.title && <p className="update-title">{post.title}</p>}
                    <p className="update-description">{post.description}</p>

                    {post.images && post.images.length > 0 && renderPostImages(post.images, openImageModal)}

                    {/* Comment Section Divider */}
                    <div style={{ borderTop: '1px solid #e5e7eb', margin: '15px 0 0 0' }}></div>
                    
                    {/* Comment Section */}
                    <CommentSection
                        postId={post.id}
                        comments={post.comments}
                        handleAddComment={handleAddComment}
                        onEditComment={handleEditComment}
                        onDeleteComment={handleDeleteComment}
                        onReportComment={handleReportComment}
                    />
                </div>
            ))}
            
            {posts.length === 0 && (
                <div className="no-announcements">
                <img
                    src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                    alt="No announcements"
                    className="no-announcement-icon"
                />
                <h3>No Announcements Yet</h3>
                <p>Stay tuned! Updates from your barangay will appear here.</p>
                </div>
            )}
        </div>
    );
};


// =========================================================
// Main ModeratorHome Component
// =========================================================
function ModeratorHome() { 
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]);
    const [date, setDate] = useState(new Date());
    const [category, setCategory] = useState('General');
    const [sortOrder, setSortOrder] = useState('newest');
    const [filterCategory, setFilterCategory] = useState('All');

    const POST_CATEGORIES = [
        'General', 'Event', 'Health Advisory', 'Safety Alert', 
        'Community Program', 'Traffic Update', 'Weather Alert', 
        'Maintenance Notice', 'Other'
    ];

    const getCategoryClass = (categoryName) => {
        if (!categoryName) return 'category-general';
        return `category-${categoryName.toLowerCase().replace(/\s+/g, '-')}`;
    };

    const processedPosts = useMemo(() => {
        let filtered = posts;
        if (filterCategory === 'All') {
            filtered = [...posts];
        } else {
            filtered = posts.filter(post => post.category === filterCategory);
        }

        return filtered.sort((a, b) => {
            return sortOrder === 'newest' ? b.date - a.date : a.date - b.date;
        });
    }, [posts, filterCategory, sortOrder]);




    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [moderatorNotifications, setModeratorNotifications] = useState(() => JSON.parse(localStorage.getItem('moderatorNotifications')) || []);
    const [openMenuPostId, setOpenMenuPostId] = useState(null);
    const [editingPost, setEditingPost] = useState(null); 
    const [isReviewReportModalOpen, setIsReviewReportModalOpen] = useState(false);
    const [isReviewCertsModalOpen, setIsReviewCertsModalOpen] = useState(false);
    const [allReports, setAllReports] = useState(() => JSON.parse(localStorage.getItem('userReports')) || []);
    const [isReportUserModalOpen, setIsReportUserModalOpen] = useState(false);
    const [reportingUser, setReportingUser] = useState(null); // For reporting a user/comment
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [isInboxModalOpen, setIsInboxModalOpen] = useState(false);
    const [moderatorInbox, setModeratorInbox] = useState(() => JSON.parse(localStorage.getItem('moderatorInbox')) || []);
    const [certificationRequests, setCertificationRequests] = useState(() => JSON.parse(localStorage.getItem('certificationRequests')) || []);
    const [undoClearTimeoutId, setUndoClearTimeoutId] = useState(null);
    const [inboxClearStatus, setInboxClearStatus] = useState(null);

    // Event-related state
    const [events, setEvents] = useState(() => JSON.parse(localStorage.getItem('calendarEvents')) || []);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedEventDate, setSelectedEventDate] = useState(new Date());
    const [currentEvent, setCurrentEvent] = useState({ id: null, title: '', description: '', time: '', endTime: '' });
    const [notificationStatus, setNotificationStatus] = useState(null); // 'clearing'
    const [currentTime, setCurrentTime] = useState(new Date());
    const [postSubmissionStatus, setPostSubmissionStatus] = useState(null); // 'saving', 'deleting', 'success'
    const [eventSubmissionStatus, setEventSubmissionStatus] = useState(null); // 'saving', 'deleting', 'success'

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [modalImages, setModalImages] = useState([]);
    const [activeMainTab, setActiveMainTab] = useState('feed'); // 'feed' or 'analytics'
    const newCertsCount = certificationRequests.filter(req => req.status === 'Pending').length;

    // Helper to format time from 'HH:mm' to 'h:mm A'
    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    // Load data and listen for changes
    useEffect(() => {
        const loadData = () => {
            setPosts(JSON.parse(localStorage.getItem("announcements")) || []);
            setAllReports(JSON.parse(localStorage.getItem("userReports")) || []);
            setModeratorNotifications(JSON.parse(localStorage.getItem("moderatorNotifications")) || []);
            setCertificationRequests(JSON.parse(localStorage.getItem("certificationRequests")) || []);
            setEvents(JSON.parse(localStorage.getItem("calendarEvents")) || []);
            setModeratorInbox(JSON.parse(localStorage.getItem("moderatorInbox")) || []);
        };
        loadData();

        const handleStorageChange = (e) => {
            if (['announcements', 'userReports', 'moderatorNotifications', 'certificationRequests', 'calendarEvents', 'moderatorInbox'].includes(e.key)) {
                loadData();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // NEW: Effect to update current time every 30 seconds for live event checking
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000); // Update every 30 seconds
        return () => clearInterval(timer);
    }, []);

    // Save events to localStorage
    useEffect(() => {
        localStorage.setItem("calendarEvents", JSON.stringify(events));
    }, [events]);

    // Save moderator inbox to localStorage
    useEffect(() => {
        localStorage.setItem("moderatorInbox", JSON.stringify(moderatorInbox));
    }, [moderatorInbox]);

    const cleanupEvents = useCallback(() => {
        const storedEvents = JSON.parse(localStorage.getItem("calendarEvents")) || [];
        if (storedEvents.length === 0) return;

        const now = new Date();
        const upcomingEvents = [];
        const justEndedEvents = [];

        storedEvents.forEach(event => {
            let eventEndDateTime;
            if (event.endTime) {
                eventEndDateTime = new Date(`${event.date}T${event.endTime}`);
            } else if (event.time) {
                eventEndDateTime = new Date(new Date(`${event.date}T${event.time}`).getTime() + 60 * 60 * 1000);
            } else {
                eventEndDateTime = new Date(`${event.date}T23:59:59`);
            }

            if (eventEndDateTime >= now) {
                upcomingEvents.push(event);
            } else {
                justEndedEvents.push(event);
            }
        });

        if (upcomingEvents.length !== storedEvents.length) {
            setEvents(upcomingEvents);
            const newNotifications = justEndedEvents.map(event => ({
                id: Date.now() + Math.random(),
                type: 'event_ended',
                message: `The event "${event.title}" has ended.`,
                isRead: false,
                date: Date.now(),
            }));

            if (newNotifications.length > 0) {
                setModeratorNotifications(prevNotifs => {
                    const allNotifs = [...newNotifications, ...prevNotifs];
                    localStorage.setItem('moderatorNotifications', JSON.stringify(allNotifs));
                    return allNotifs;
                });
            }
        }
    }, []);

    // Automatically clean up past events from localStorage on load and every minute
    useEffect(() => {
        cleanupEvents(); // Run once on mount
        const intervalId = setInterval(cleanupEvents, 60000); // Run every 60 seconds
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [cleanupEvents]);

    const handlePost = () => {
        setPostSubmissionStatus('saving');
        setTimeout(() => {
        // If we are editing, call the update handler instead
        if (editingPost) {
                const updatedPost = {
                    ...editingPost,
                    title,
                    description,
                    category,
                    images,
                };
                setPosts(posts.map(p => p.id === editingPost.id ? updatedPost : p));
                logAuditAction('Updated Announcement', { postId: editingPost.id, title }, 'moderator');
            } else {
                // Logic for creating a new post
                if (description.trim()) {
                    const newPost = {
                        id: Date.now(),
                        title,
                        description,
                        images,
                        author: "Community Moderator",
                        authorAvatar: "https://via.placeholder.com/48/2563eb/ffffff?text=M",
                        category: category,
                        date: Date.now(), // Store date as a timestamp
                        comments: [], // Initialize comments array
                    };
                    setPosts([newPost, ...posts]);
                    logAuditAction('Created Announcement', { postId: newPost.id, title: newPost.title }, 'moderator');

                    // Create a notification for the new announcement
                    const notif = {
                        id: Date.now(),
                        type: 'new_announcement',
                        message: `A new announcement has been posted: "${title || description.slice(0, 30) + '...'}"`,
                        postId: newPost.id,
                        isRead: false,
                        date: Date.now()
                    };
                    const currentNotifs = JSON.parse(localStorage.getItem('notifications')) || [];
                    localStorage.setItem('notifications', JSON.stringify([notif, ...currentNotifs]));
                }
            }

            setPostSubmissionStatus('success');
            setTimeout(() => {
                setIsPostModalOpen(false);
                setEditingPost(null);
                setTitle("");
                setDescription("");
                setImages([]);
                setCategory('General');
                setPostSubmissionStatus(null);
            }, 1000);
        }, 1000);
        }
    
    // Save posts to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("announcements", JSON.stringify(posts));
    }, [posts]);

    // --- Post Handlers ---
    const handleImageChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files).map((file) =>
                URL.createObjectURL(file)
            );
            setImages(filesArray);
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        // Revoke the object URL to prevent memory leaks
        URL.revokeObjectURL(images[indexToRemove]);
        setImages(images.filter((_, index) => index !== indexToRemove));
    };

    const handleDeletePost = (postId) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            setPostSubmissionStatus('deleting');
            setTimeout(() => {
                setPosts(posts.filter(post => post.id !== postId));
                logAuditAction('Deleted Announcement', { postId }, 'moderator');
                setPostSubmissionStatus(null); // Reset status after deletion
            }, 1000);
        }
    };

    const handleEditClick = (post) => {
        setEditingPost(post);
        setTitle(post.title);
        setDescription(post.description);
        setCategory(post.category || 'General');
        setImages(post.images);
        setIsPostModalOpen(true);
    };

    const handlePermanentDeleteReport = (reportId) => {
        if (window.confirm("Are you sure you want to permanently delete this report?")) {
            const updatedReports = allReports.filter(report => report.id !== reportId);
            logAuditAction('Deleted Report', { reportId }, 'moderator');
            setAllReports(updatedReports);
            // Also update localStorage to persist deletion
            localStorage.setItem("userReports", JSON.stringify(updatedReports));
        }
    };

    const handleUpdateReportStatus = (reportId, newStatus) => {
        const userProfile = JSON.parse(localStorage.getItem('userProfile'));
        const moderatorName = userProfile?.name || 'Moderator';

        let reportToUpdate;
        const updatedReports = allReports.map(report => {
            if (report.id === reportId) {
                reportToUpdate = { ...report, status: newStatus };
                return reportToUpdate;
            }
            return report;
        });
        setAllReports(updatedReports);
        logAuditAction('Updated Report Status', { reportId, newStatus }, 'moderator');
        localStorage.setItem("userReports", JSON.stringify(updatedReports));

        // Create a notification for the report update
        const notif = {
            id: Date.now(),
            type: 'report_update',
            message: `Your report "${reportToUpdate.type}" has been updated to "${newStatus}" by ${moderatorName}.`,
            reportId: reportId,
            isRead: false,
            date: Date.now()
        };
        const currentNotifs = JSON.parse(localStorage.getItem('notifications')) || [];
        localStorage.setItem('notifications', JSON.stringify([notif, ...currentNotifs]));
    };

    const handleUpdateCertRequestStatus = (requestId, newStatus) => {
        const userProfile = JSON.parse(localStorage.getItem('userProfile'));
        const moderatorName = userProfile?.name || 'Moderator';

        let requestToUpdate;
        const updatedRequests = certificationRequests.map(req => {
            if (req.id === requestId) {
                requestToUpdate = { ...req, status: newStatus };
                return requestToUpdate;
            }
            return req;
        });
        setCertificationRequests(updatedRequests);
        logAuditAction('Updated Certificate Request Status', { requestId, newStatus }, 'moderator');
        localStorage.setItem("certificationRequests", JSON.stringify(updatedRequests));

        // Create a notification for the resident
        const notif = {
            id: Date.now() + 1,
            type: 'cert_update',
            message: `Your request for "${requestToUpdate.type}" has been ${newStatus.toLowerCase()} by ${moderatorName}.`,
            requestId: requestId,
            isRead: false,
            date: Date.now()
        };
        const currentNotifs = JSON.parse(localStorage.getItem('notifications')) || [];
        localStorage.setItem('notifications', JSON.stringify([notif, ...currentNotifs]));

        // If approved, send a message to the resident's inbox
        if (newStatus === 'Approved') {
            const inboxMessage = {
                id: Date.now() + 2, // to avoid collision with notif
                type: 'approved_certificate',
                details: requestToUpdate.details, // Pass the whole details object
                certificateType: requestToUpdate.type,
                purpose: requestToUpdate.purpose,
                frontIdImage: requestToUpdate.frontIdImage, // Pass all possible images
                backIdImage: requestToUpdate.backIdImage,
                utilityBillImage: requestToUpdate.utilityBillImage,
                proofOfResidencyImage: requestToUpdate.proofOfResidencyImage,
                communityTaxCertImage: requestToUpdate.communityTaxCertImage,
                dateApproved: Date.now(),
                isRead: false,
            };
            const residentInbox = JSON.parse(localStorage.getItem('residentInbox')) || [];
            localStorage.setItem('residentInbox', JSON.stringify([inboxMessage, ...residentInbox]));
        }
    };

    const handleDeleteCertRequest = (requestId) => {
        const updatedRequests = certificationRequests.filter(req => req.id !== requestId);
        setCertificationRequests(updatedRequests);
        localStorage.setItem("certificationRequests", JSON.stringify(updatedRequests));
        logAuditAction('Permanently Deleted Certificate Request', { requestId }, 'moderator');
    };

    const handleOpenNotifications = () => {
        setIsNotificationModalOpen(true);
        // Mark all notifications as read when the modal is opened
        const updatedNotifications = moderatorNotifications.map(n => ({ ...n, isRead: true }));
        setModeratorNotifications(updatedNotifications);
        localStorage.setItem('moderatorNotifications', JSON.stringify(updatedNotifications));
    };

    const handleClearNotifications = () => {
        if (window.confirm("Are you sure you want to clear all notifications?")) {
            setNotificationStatus('clearing');
            setTimeout(() => {
                setModeratorNotifications([]);
                localStorage.setItem('moderatorNotifications', JSON.stringify([]));
                setNotificationStatus(null); // Reset status
                setIsNotificationModalOpen(false); // Close modal after clearing
            }, 1000);
        }
    };

    const handleDeleteNotification = (notificationId) => {
        const updatedNotifications = moderatorNotifications.filter(n => n.id !== notificationId);
        setModeratorNotifications(updatedNotifications);
        localStorage.setItem('moderatorNotifications', JSON.stringify(updatedNotifications));
    };

    const handleOpenInbox = () => {
        setIsInboxModalOpen(true);
        // Mark all inbox messages as read when opened
        const updatedMessages = moderatorInbox.map(msg => ({ ...msg, isRead: true }));
        setModeratorInbox(updatedMessages);
    };

    const handleMarkInboxAsRead = (messageId) => {
        const updatedMessages = moderatorInbox.map(msg =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
        );
        setModeratorInbox(updatedMessages);
    };

    const handleDeleteInboxMessage = (messageId) => {
        if (window.confirm("Are you sure you want to delete this message?")) {
            const updatedMessages = moderatorInbox.filter(msg => msg.id !== messageId);
            setModeratorInbox(updatedMessages);
        }
    };

    const handleClearInbox = () => {
        if (window.confirm("Are you sure you want to clear all messages from the inbox?")) {
            setInboxClearStatus('clearing');
            setTimeout(() => {
                setModeratorInbox([]);
                localStorage.setItem('moderatorInbox', JSON.stringify([]));
                setInboxClearStatus(null);
                setIsInboxModalOpen(false);
            }, 1000);
        }
    };

    const handleClearAllDashboardData = () => {
        if (window.confirm("DANGER: Are you sure you want to permanently delete ALL reports and certificate requests? This action cannot be undone.")) {
            setAllReports([]);
            setCertificationRequests([]);
            localStorage.removeItem('userReports');
            localStorage.removeItem('certificationRequests');
            logAuditAction('Cleared All Dashboard Data (Reports & Requests)', {}, 'moderator');
        }
    };

    const handleClosePostModal = () => {
        setIsPostModalOpen(false);
        setEditingPost(null); // Clear editing state
        setTitle("");
        setDescription("");
        setImages([]);
        setCategory('General');
        setPostSubmissionStatus(null);
    };


    const handleLogout = () => {
        // For now, just navigate to login. In a real app, you'd clear tokens/session state.
        console.log("Logging out...");
        navigate("/login");
    };

    // --- Comment Handler ---
    const handleAddComment = (postId, commentText) => {
        const newComment = {
            id: Date.now(),
            author: "Community Moderator", 
            authorAvatar: "https://via.placeholder.com/48/2563eb/ffffff?text=M",
            date: Date.now(), // Store date as a timestamp
            text: commentText,
        };

        setPosts(prevPosts => 
            prevPosts.map(post => 
                post.id === postId 
                    ? { ...post, comments: [...post.comments, newComment] }
                    : post
            )
        );
    };

    const handleEditComment = (postId, commentId, newText) => {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: post.comments.map(comment => 
                        comment.id === commentId ? { ...comment, text: newText } : comment
                    )
                };
            }
            return post;
        }));
    };

    const handleDeleteComment = (postId, commentId) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            const updatedPosts = posts.map(post => post.id === postId ? { ...post, comments: post.comments.filter(c => c.id !== commentId) } : post);
            setPosts(updatedPosts);
        }
    };

    const handleReportComment = (comment) => {
        setReportingUser(comment.author); // Pass the author's name
        setIsSupportModalOpen(true); // Open the main support modal
        logAuditAction('Opened Report Form for Comment', { reportedUser: comment.author, commentId: comment.id }, 'moderator');
    };

    const handleReportCommentSubmit = (user, reason) => {
        // 'user' here is the comment object we passed
        console.log(`Reporting comment by ${user.author} to admin. Reason: ${reason}`);
        const adminMessage = {
            id: Date.now(),
            subject: `Comment Report: ${user.author}`,
            body: `A comment has been reported.\n\nAuthor: ${user.author}\nComment: "${user.text}"\n\nReason for report: ${reason}`,
            date: Date.now(),
            isRead: false,
        };
        // In a real app, this would go to an admin-specific inbox, but for now, we can log it
        // or create a new localStorage item for admin messages.
        logAuditAction('Reported Comment to Admin', { reportedUser: user.author, commentId: user.id, reason }, 'moderator');
    };

    // --- Event Handlers ---
    const handleSelectDate = (date) => {
        setDate(date);
        // For simplicity, we'll just show events for the selected day.
        // Clicking a date doesn't open the modal directly anymore,
        // but you could change this behavior if you want.
    };

    const handleOpenEventModal = (eventToEdit = null) => {
        if (eventToEdit) {
            setSelectedEventDate(new Date(eventToEdit.date));
            setCurrentEvent({ id: eventToEdit.id, title: eventToEdit.title, description: eventToEdit.description, time: eventToEdit.time || '', endTime: eventToEdit.endTime || '' });
        } else {
            setSelectedEventDate(date); // Use the currently selected calendar date
            setCurrentEvent({ id: null, title: '', description: '', time: '', endTime: '' });
        }
        setIsEventModalOpen(true);
    };

    const handleSaveEvent = () => {
        setEventSubmissionStatus('saving');
        setTimeout(() => {
            // Timezone-safe date formatting
            const toYYYYMMDD = (date) => {
                const d = new Date(date);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const eventToSave = {
                ...currentEvent,
                date: toYYYYMMDD(selectedEventDate),
                time: currentEvent.time,
                endTime: currentEvent.endTime,
            };

            if (eventToSave.id) {
                setEvents(events.map(e => e.id === eventToSave.id ? eventToSave : e));
                logAuditAction('Updated Event', { eventId: eventToSave.id, title: eventToSave.title, time: eventToSave.time, endTime: eventToSave.endTime }, 'moderator');
            } else {
                const newEvent = { ...eventToSave, id: Date.now() };
                setEvents([...events, newEvent]);
                logAuditAction('Created Event', { eventId: newEvent.id, title: newEvent.title, time: newEvent.time, endTime: newEvent.endTime }, 'moderator');

                // Notify residents about the new event
                const notif = {
                    id: Date.now() + 1, // avoid collision
                    type: 'new_event',
                    message: `A new event has been scheduled: "${newEvent.title}"`,
                    isRead: false,
                    date: Date.now(),
                };
                const currentNotifs = JSON.parse(localStorage.getItem('notifications')) || [];
                localStorage.setItem('notifications', JSON.stringify([notif, ...currentNotifs]));
            }
            setEventSubmissionStatus('success');
            setTimeout(() => {
                setIsEventModalOpen(false);
                setEventSubmissionStatus(null);
            }, 1500);
        }, 1000);
    };

    const handleDeleteEvent = (eventId) => {
        setEventSubmissionStatus('deleting');
        setTimeout(() => {
            setEvents(events.filter(e => e.id !== eventId));
            logAuditAction('Deleted Event', { eventId }, 'moderator');
            setEventSubmissionStatus('success');
            setTimeout(() => {
                setIsEventModalOpen(false);
                setEventSubmissionStatus(null);
            }, 1500);
        }, 1000);
    };

    const handleEndEvent = (eventId) => {
        setEventSubmissionStatus('saving');
        setTimeout(() => {
            const now = new Date();
            const updatedEvents = events.map(e => {
                if (e.id === eventId) {
                    logAuditAction('Manually Ended Event', { eventId, title: e.title }, 'moderator');
                    const toYYYYMMDD = (d) => {
                        return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                    };
                    // Set end time to now to trigger cleanup
                    // Also set date to today to prevent future events from reappearing
                    return { ...e, date: toYYYYMMDD(now), endTime: now.toTimeString().slice(0, 5) };
                }
                return e;
            });
            setEvents(updatedEvents); // This will trigger the save to localStorage
            cleanupEvents(); // Immediately process the ended event
            setEventSubmissionStatus('success');
            setTimeout(() => {
                setIsEventModalOpen(false);
                setEventSubmissionStatus(null);
            }, 1500);
        }, 1000);
    };

    const handleCloseEventModal = () => {
        setIsEventModalOpen(false);
        setEventSubmissionStatus(null);
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            // Timezone-safe date formatting
            const toYYYYMMDD = (d) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            const dateString = toYYYYMMDD(date);
            const hasEvent = events.some(event => event.date === dateString);
            return hasEvent ? <div className="event-dot"></div> : null;
        }
        return null;
    };

    const upcomingEvents = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to the beginning of today to include today's events
        // The `new Date(event.date)` can have timezone issues.
        // Adding 'T00:00:00' makes it explicit that it's local time midnight.
        return events
            .filter(event => {
                const eventDate = new Date(`${event.date}T00:00:00`);
                return eventDate >= today;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [events]);

    // --- Image Preview Modal Logic (for existing posts) ---
    const openImageModal = (allImages, index) => {
        setModalImages(allImages);
        setCurrentImageIndex(index);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
    };

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) => 
            (prevIndex + 1) % modalImages.length
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            (prevIndex - 1 + modalImages.length) % modalImages.length
        );
    };
    
    // --- Image Rendering Logic (for posts in feed) ---
    const renderPostImages = (postImages, onClickFunction) => {
        const totalImages = postImages.length;
        const visibleImages = totalImages > 3 ? postImages.slice(0, 3) : postImages;

        return (
            <div className={`update-images update-images-${Math.min(totalImages, 4)}`}>
                {visibleImages.map((img, index) => (
                    <img 
                        src={img} 
                        alt={`post ${index}`} 
                        key={index} 
                        onClick={() => onClickFunction(postImages, index)}
                    />
                ))}
                {totalImages >= 4 && (
                    <div 
                        className="image-count-overlay"
                        onClick={() => onClickFunction(postImages, 3)}
                    >
                        <span>+{totalImages - 3}</span>
                    </div>
                )}
            </div>
        );
    };

    // --- Image Rendering Logic (for post modal preview) ---
    const renderPreviewImages = (previewImages, onRemove) => {
        const totalImages = previewImages.length;
        return (
            <div className={`preview-images preview-images-${Math.min(totalImages, 4)}`}>
                {previewImages.slice(0, 4).map((img, index) => (
                    <div className="preview-image-container" key={index}>
                        <img src={img} alt={`preview ${index}`} />
                        <button 
                            type="button" 
                            className="remove-preview-btn" 
                            onClick={() => onRemove(index)}
                        >
                            <FaTimes />
                        </button>
                    </div>
                ))}
                {previewImages.length > 4 && (
                    <div className="preview-count-overlay">
                        <span>+{previewImages.length - 4}</span>
                    </div>
                )}
            </div>
        );
    };

    // --- Image Preview Modal Component ---
    const ImagePreviewModal = () => {
        if (!isImageModalOpen || modalImages.length === 0) return null;

        return (
            <div className="preview-modal-overlay" onClick={closeImageModal}>
                <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>                    
                    <button className="preview-close-btn" onClick={closeImageModal}><FaTimes /></button>
                    
                    <img 
                        src={modalImages[currentImageIndex]} 
                        alt={`Preview ${currentImageIndex + 1}`} 
                        className="modal-image"
                    />

                    {modalImages.length > 1 && (
                        <>
                            <button className="nav-btn prev-btn" onClick={prevImage}>
                                <FaChevronLeft size={30} />
                            </button>
                            <button className="nav-btn next-btn" onClick={nextImage}>
                                <FaChevronRight size={30} />
                            </button>
                        </>
                    )}

                    <div className="image-counter">
                        {currentImageIndex + 1} of {modalImages.length}
                    </div>
                </div>
            </div>
        );
    };

    // Calculate the number of new reports to show in the badge
    const newReportsCount = allReports.filter(report => report.status === 'submitted').length;

    return (
      <ThemeProvider>
        <div className="moderator-page">
            <ImagePreviewModal />
            {/* --- NEW: Global Post Submission Overlay --- */}
            {postSubmissionStatus && (
                <div className="submission-overlay-global">
                    <div className="submission-content">
                        {postSubmissionStatus === 'saving' && (
                            <>
                                <div className="spinner"></div>
                                <p>{editingPost ? "Saving Changes..." : "Creating Post..."}</p>
                            </>
                        )}
                        {postSubmissionStatus === 'deleting' && (
                            <>
                                <div className="spinner"></div>
                                <p>Deleting Post...</p>
                            </>
                        )}
                        {postSubmissionStatus === 'success' && (
                            <>
                                <FaCheckCircle className="success-icon" size={60} />
                                <p>Success!</p>
                            </>
                        )}
                    </div>
                </div>
            )}


            <ProfileModal 
              isOpen={isProfileModalOpen}
              onClose={() => setIsProfileModalOpen(false)}
              onLogout={handleLogout}
            />

            <PostModal 
                isOpen={isPostModalOpen}
                onClose={handleClosePostModal}
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                images={images}
                setImages={setImages}
                handlePost={handlePost}
                handleImageChange={handleImageChange}
                renderPreviewImages={(imgs) => renderPreviewImages(imgs, handleRemoveImage)}
                editingPost={editingPost}
                category={category}
                setCategory={setCategory}
            />

            <SettingModal
             isOpen={isSettingsModalOpen}
             onClose={() => setIsSettingsModalOpen(false)}
             role="moderator"
            />

            <ReviewReportModal
                isOpen={isReviewReportModalOpen}
                onClose={() => setIsReviewReportModalOpen(false)}
                reports={allReports}
                onUpdateReportStatus={handleUpdateReportStatus}
                onDeleteReport={handlePermanentDeleteReport}
            />

            <ReviewCertsModal
                isOpen={isReviewCertsModalOpen}
                onClose={() => setIsReviewCertsModalOpen(false)}
                requests={certificationRequests}
                onUpdateStatus={handleUpdateCertRequestStatus}
                onDeleteRequest={handleDeleteCertRequest}
            />

            <NotificationModal
                isOpen={isNotificationModalOpen}
                onClose={() => setIsNotificationModalOpen(false)}
                notifications={moderatorNotifications}
                onClear={handleClearNotifications}
                onDelete={handleDeleteNotification}
                submissionStatus={notificationStatus}
            />

            <EventModal
                isOpen={isEventModalOpen}
                onClose={handleCloseEventModal}
                selectedDate={selectedEventDate}
                event={currentEvent}
                setEventTitle={(title) => setCurrentEvent(prev => ({ ...prev, title }))}
                setEventDescription={(description) => setCurrentEvent(prev => ({ ...prev, description }))}
                setEventTime={(time) => setCurrentEvent(prev => ({ ...prev, time }))}
                setEventEndTime={(endTime) => setCurrentEvent(prev => ({ ...prev, endTime }))}
                onSave={handleSaveEvent}
                onEnd={handleEndEvent}
                submissionStatus={eventSubmissionStatus}
            />

            <SupportModal
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
                initialReportedUser={reportingUser}
            />

            <ModeratorInboxModal
                isOpen={isInboxModalOpen}
                onClose={() => setIsInboxModalOpen(false)}
                messages={moderatorInbox}
                onMarkAsRead={handleMarkInboxAsRead}
                onDelete={handleDeleteInboxMessage}
                onClearAll={handleClearInbox}
                submissionStatus={inboxClearStatus}
            />

            <ReportUserModal
                isOpen={isReportUserModalOpen}
                onClose={() => setIsReportUserModalOpen(false)}
                user={reportingUser}
                onSubmit={handleReportCommentSubmit}
            />


            {/* Use the new Header Component */}
            <Header /> 

            <div className="content">
                {/* Left Sidebar */}
                <aside className="m-left-panel">
                    <div className="m-side-buttons">
                        <button
                            className="m-sidebar-btn orange"    
                            onClick={() => setIsProfileModalOpen(true)}
                        >
                            <FaUser size={30} />
                            <span>Profile</span>
                        </button>

                        <button className="m-sidebar-btn blue notification-bell-btn" onClick={handleOpenNotifications}>
                            <FaBell size={30} />
                            <span>Notifications</span>
                            {moderatorNotifications.filter(n => !n.isRead).length > 0 && (
                                <span className="notification-badge">{moderatorNotifications.filter(n => !n.isRead).length}</span>
                            )}
                        </button>

                        <button className="m-sidebar-btn soft-blue" onClick={handleOpenInbox}>
                            <FaInbox size={30} />
                            <span>Inbox</span>
                            {moderatorInbox.filter(m => !m.isRead).length > 0 && (
                                <span className="notification-badge">{moderatorInbox.filter(m => !m.isRead).length}</span>
                            )}
                        </button>

                        <button 
                            className="m-sidebar-btn purple" 
                            onClick={() => setIsPostModalOpen(true)}
                        >
                            <FaPlus size={30} />
                            <span>Create Announcement</span>
                        </button>
                        
                        <button 
                            className="m-sidebar-btn teal"
                            onClick={() => setIsReviewCertsModalOpen(true)}
                        >
                            <MdOutlineAssignment size={30} />
                            <span>Certification Requests</span>
                            {newCertsCount > 0 && (
                                <span className="notification-badge">{newCertsCount}</span>
                            )}
                        </button>

                        <button 
                            className="m-sidebar-btn red"
                            onClick={() => setIsReviewReportModalOpen(true)}
                        >
                            <FaFileAlt size={30} />
                            <span>Resident Reports</span>
                            {newReportsCount > 0 && (
                                <span className="notification-badge">{newReportsCount}</span>
                            )}
                        </button>
                        
                        <button
                            className="m-sidebar-btn green"
                            onClick={() => setIsSupportModalOpen(true)}
                        >
                            <FaHeadset size={30} />
                            <span>Support</span>
                        </button>

                        <button className="m-sidebar-btn gray"
                            onClick={() => setIsSettingsModalOpen(true)}
                        >
                            <FaCog size={30} />
                            <span>Settings</span>

                        </button>
                    </div>
                </aside>

                {/* Main Content Feed Component */}
                <main className="main-content">
                    <div className="main-content-tabs">
                        
                        <button 
                            className={`main-tab-btn ${activeMainTab === 'feed' ? 'active' : ''}`}
                            onClick={() => setActiveMainTab('feed')}
                        >
                            Announcements Feed
                        </button>
                        <button 
                            className={`main-tab-btn ${activeMainTab === 'analytics' ? 'active' : ''}`}
                            onClick={() => setActiveMainTab('analytics')}
                        >
                            Dashboard & Analytics
                        </button>
                    </div>
                    
                    {activeMainTab === 'analytics' ? (
                        <AnalyticsDashboard 
                            reports={allReports} 
                            requests={certificationRequests} 
                            onClearAllData={handleClearAllDashboardData} />
                    ) : (
                        <>   
                            <div className="feed-controls">
                                <h3 className="feed-title">Announcements Feed</h3>
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
                            <MainContentFeed
                                posts={processedPosts}
                                handleDeletePost={handleDeletePost}
                                handleEditClick={handleEditClick}
                                renderPostImages={renderPostImages}
                                openImageModal={openImageModal}
                                openMenuPostId={openMenuPostId}
                                setOpenMenuPostId={setOpenMenuPostId}
                                handleAddComment={handleAddComment}
                                handleEditComment={handleEditComment}
                                handleDeleteComment={handleDeleteComment}
                                handleReportComment={handleReportComment}
                                getCategoryClass={getCategoryClass}
                            />
                        </>
                    )}
                </main>

                {/* Right Sidebar */}
                <aside className="right-panel">
                    <div className="calendar-box">
                        <h4>CALENDAR</h4>
                        <Calendar 
                            value={date} 
                            onChange={handleSelectDate} 
                            tileContent={tileContent}
                        />
                        <button className="add-event-btn" onClick={() => handleOpenEventModal()}>Add Event for this Date</button>
                    </div>

                    <div className="events-box">
                        <h4>UPCOMING EVENTS</h4>
                        <div className="events-list">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map(event => {
                                    const { isToday, isHappeningNow, hasEnded } = checkEventStatus(event, currentTime);

                                    const eventClasses = `event-item ${isToday ? 'event-item-today' : ''} ${
                                        isHappeningNow ? 'event-item-now' : hasEnded ? 'event-item-ended' : 'event-item-upcoming'
                                    }`;
                                    return (
                                        <div key={event.id} className={eventClasses} onClick={() => handleOpenEventModal(event)}>
                                            <div className="event-item-header">
                                                <p className="event-item-title">{event.title}</p>
                                                {isHappeningNow && <span className="live-badge">Ongoing</span>}
                                                {hasEnded && <span className="live-badge ended" style={{ backgroundColor: '#ef4444' }}>Ended</span>}
                                            </div>
                                            <p className="event-item-desc">{event.description}</p>
                                            <p className="event-item-date-display">
                                                {new Date(event.date.replace(/-/g, '/')).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                                {event.time && (
                                                <span className="event-item-time">
                                                    {' at '}
                                                    {formatTime(event.time)}{event.endTime ? ` - ${formatTime(event.endTime)}` : ''}
                                                </span>
                                                )}
                                            </p>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="no-events-message">No upcoming events scheduled.</p>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
      </ThemeProvider>
    );
}

export default ModeratorHome;