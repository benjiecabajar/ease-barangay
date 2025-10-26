// pages/Home.jsx

import React, { useState, useEffect, useMemo } from "react";
import Calendar from "react-calendar"; 
import { useNavigate } from "react-router-dom";
import "react-calendar/dist/Calendar.css";
import "../styles/resident.css";
import {
  FaUser,
  FaCog,
  FaFileAlt,
  FaHeadset,  
  FaClipboardList,
  FaInfoCircle,
  FaBell,
  FaInbox,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaEllipsisH,  
  FaEdit,
  FaExclamationTriangle,
  FaTrash,
} from "react-icons/fa";
import { MdOutlineAssignment } from "react-icons/md";
import CommentSection from "../components/comment-section.jsx";
import Header from "../components/header.jsx";
import ProfileModal from "../components/modal-profile.jsx";
import SettingModal from "../components/modal-settings.jsx"; 
import ReportModal from "../components/modal-r-report.jsx";
import { ThemeProvider } from "../components/ThemeContext.jsx";
import ViewReportsModal from "../components/modal-view-reports.jsx";
import NotificationModal from "../components/modal-notification.jsx"; // Import the new modal
import RequestCertificationModal from "../components/modal-request-cert.jsx";
import ViewEventsModal from "../components/view-events-modal.jsx";
import InboxModal from "../components/modal-inbox.jsx";
import SupportModal from "../components/r-support-modal.jsx";
import { logAuditAction } from "../utils/auditLogger.js";
import { checkEventStatus } from "../utils/eventUtils.js";

function Home() {
  const [date, setDate] = useState(new Date());
  const [posts, setPosts] = useState([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isViewReportsModalOpen, setIsViewReportsModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [certSubmissionStatus, setCertSubmissionStatus] = useState(null); // 'submitting', 'success', 'error'
  const [reportingUser, setReportingUser] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'submitting', 'success', 'error'
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('notifications')) || []);
  const [userReports, setUserReports] = useState(() => JSON.parse(localStorage.getItem('userReports')) || []);
  const [events, setEvents] = useState(() => JSON.parse(localStorage.getItem('calendarEvents')) || []);
  const [inboxMessages, setInboxMessages] = useState(() => JSON.parse(localStorage.getItem('residentInbox')) || []);
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false);
  const [recentlyDeletedMessage, setRecentlyDeletedMessage] = useState(null);
  const [undoTimeoutId, setUndoTimeoutId] = useState(null);
  const [recentlyClearedItems, setRecentlyClearedItems] = useState(null); // For Clear All
  const [undoClearTimeoutId, setUndoClearTimeoutId] = useState(null);
  const [notificationClearStatus, setNotificationClearStatus] = useState(null);
  const [inboxClearStatus, setInboxClearStatus] = useState(null);

  // State for the new event view modal
  const [isViewEventsModalOpen, setIsViewEventsModalOpen] = useState(false);
  const [eventsForModal, setEventsForModal] = useState([]);

  const POST_CATEGORIES = [
      'General', 'Event', 'Health Advisory', 'Safety Alert', 
      'Community Program', 'Traffic Update', 'Weather Alert', 
      'Maintenance Notice', 'Other'
  ];

  const navigate = useNavigate();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalImages, setModalImages] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sortOrder, setSortOrder] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('All');


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
  // Load data and listen for changes from other tabs
  useEffect(() => {
    const loadData = () => {
      setPosts(JSON.parse(localStorage.getItem("announcements")) || []);
      setUserReports(JSON.parse(localStorage.getItem("userReports")) || []);
      setNotifications(JSON.parse(localStorage.getItem("notifications")) || []);
      setEvents(JSON.parse(localStorage.getItem('calendarEvents')) || []);
      setInboxMessages(JSON.parse(localStorage.getItem('residentInbox')) || []);
    };
    loadData();

    const handleStorageChange = (e) => {
      if (['announcements', 'userReports', 'notifications', 'calendarEvents', 'residentInbox'].includes(e.key)) {
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

  // Save data to localStorage when it changes in this component
  useEffect(() => {
    localStorage.setItem("userReports", JSON.stringify(userReports));
  }, [userReports]);
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem("residentInbox", JSON.stringify(inboxMessages));
  }, [inboxMessages]);

  useEffect(() => {
    const cleanupEvents = () => {
      const storedEvents = JSON.parse(localStorage.getItem("calendarEvents")) || [];
      if (storedEvents.length === 0) return;

      const now = new Date();
      const upcomingEvents = [];
      const justEndedEvents = [];

      storedEvents.forEach((event) => {
        let eventEndDateTime;
        if (event.endTime) {
          eventEndDateTime = new Date(`${event.date}T${event.endTime}`);
        } else if (event.time) {
          eventEndDateTime = new Date(
            new Date(`${event.date}T${event.time}`).getTime() + 60 * 60 * 1000
          );
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

        const newNotifications = justEndedEvents.map((event) => ({
          id: Date.now() + Math.random(),
          type: "event_ended",
          message: `The event "${event.title}" has ended.`,
          isRead: false,
          date: Date.now(),
        }));

        if (newNotifications.length > 0) {
          setNotifications((prevNotifs) => {
            const allNotifs = [...newNotifications, ...prevNotifs];
            localStorage.setItem("notifications", JSON.stringify(allNotifs));
            return allNotifs;
          });
        }
      }
    };

    cleanupEvents(); // Run once on mount
    const intervalId = setInterval(cleanupEvents, 60000); // Run every 60 seconds
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // --- Comment Handler ---
  const handleAddComment = (postId, commentText) => {
    const newComment = {
        id: Date.now(),
        author: "Resident User",
        authorAvatar: "https://via.placeholder.com/30/7c3aed/ffffff?text=R",
        date: Date.now(),
        text: commentText
    };

    const updatedPosts = posts.map(post =>
      post.id === postId
        ? { ...post, comments: [...(post.comments || []), newComment] }
        : post
    );

    setPosts(updatedPosts);
    localStorage.setItem("announcements", JSON.stringify(updatedPosts));
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
          localStorage.setItem("announcements", JSON.stringify(updatedPosts));
      }
  };

  const handleReportComment = (comment) => {
    setReportingUser(comment.author);
    setIsSupportModalOpen(true);
    logAuditAction('Opened Report Form for Comment', { reportedUser: comment.author, commentId: comment.id }, 'resident');

    // Notify the support modal (in case it's rendered via portal) so it can
    // prefill and scroll to the report area reliably.
    // Small timeout gives React time to render the modal into the DOM.
    setTimeout(() => {
      // This custom event is for a more robust way to communicate with the modal,
      // especially if it were rendered in a portal or a different part of the DOM tree.
      // The modal will listen for this event and scroll to the report section.
      window.dispatchEvent(new CustomEvent('openSupportReport', {
        detail: { reportedUser: comment.author, commentId: comment.id }
      }));
    }, 60); // A small delay is enough for React to render the modal.
  };

  const handleReportUserSubmit = (reportedUserName, reason) => {
    const newReport = {
        id: Date.now(),
        date: Date.now(),
        status: "submitted",
        type: "User Behavior", // A new, distinct type
        description: `Report against ${reportedUserName}: ${reason}`,
        media: [],
        location: null,
    };
    setUserReports(prev => [...prev, newReport]);
    logAuditAction('Submitted User Behavior Report', { reportedUser: reportedUserName }, 'resident');

    // Create a notification for the moderator
    const modNotif = { id: Date.now() + 1, type: 'new_report', message: `A new user behavior report has been submitted.`, reportId: newReport.id, isRead: false, date: Date.now() };
    const currentModNotifs = JSON.parse(localStorage.getItem('moderatorNotifications')) || [];
    localStorage.setItem('moderatorNotifications', JSON.stringify([modNotif, ...currentModNotifs]));
    alert(`Your report against "${reportedUserName}" has been submitted to the moderator for review.`);
  };

  const handleReportSubmit = async (reportData) => {
    // In a real app, you'd send this to a server.
    try {
        setSubmissionStatus('submitting');
        console.log("New Report Submitted:", reportData.type, reportData.description);

        // Wait for 2 seconds to show the loading spinner
        setTimeout(async () => {
            // Convert images to data URLs for storage and display
            const mediaUrls = await Promise.all(
                reportData.media.map(file => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                })
            );

            const newReport = {
                id: Date.now(),
                date: Date.now(),
                status: "submitted",
                type: reportData.type,
                description: reportData.description,
                media: mediaUrls,
                location: reportData.location,
            };
            setUserReports(prev => [...prev, newReport]);
            logAuditAction('Submitted Report', { reportId: newReport.id, type: newReport.type }, 'resident');

            // Create a notification for the moderator
            const modNotif = {
                id: Date.now() + 1,
                type: 'new_report',
                message: `A new "${newReport.type}" report has been submitted.`,
                reportId: newReport.id,
                isRead: false,
                date: Date.now()
            };
            const currentModNotifs = JSON.parse(localStorage.getItem('moderatorNotifications')) || [];
            localStorage.setItem('moderatorNotifications', JSON.stringify([modNotif, ...currentModNotifs]));

            setSubmissionStatus('success');

            setTimeout(() => {
                setIsReportModalOpen(false);
                setSubmissionStatus(null);
            }, 1500);
        }, 2000); // 2-second delay for the spinner
    } catch (error) {
      console.error("Report submission failed:", error);
      setSubmissionStatus('error');
    }
  };

  const handleCancelReport = (reportId) => {
    // Instead of deleting, update the status to 'canceled'.
    // This preserves the report for the moderator's view.
    setUserReports(prevReports =>
      prevReports.map(report =>
        report.id === reportId ? { ...report, status: 'canceled' } : report
      )
    );
    // The useEffect hook will save this change to localStorage.
    logAuditAction('Canceled Report by Resident', { reportId }, 'resident');
  };

  const handleDeleteReport = (reportId) => {
    if (window.confirm("Are you sure you want to permanently delete this report? This action cannot be undone.")) {
      setUserReports(prevReports => {
        return prevReports.map(report => {
          if (report.id === reportId) {
            // If it's already canceled, use a special archived status. Otherwise, use the standard 'archived'.
            const newStatus = report.status === 'canceled' ? 'canceled-archived' : 'archived';
            return { ...report, status: newStatus };
          }
          return report;
        });
      });
      logAuditAction('Archived Report by Resident', { reportId }, 'resident');
    }
  };

  const handleCertRequestSubmit = async (requestData) => {
    setCertSubmissionStatus('submitting');

    try {
        // Helper to convert a file to a base64 data URL
        const toBase64 = file => new Promise((resolve, reject) => { //
            if (!file) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });

        // Convert all possible files to base64 in parallel
        const [
            frontIdImageBase64,
            backIdImageBase64,
            residencyGovIdFrontBase64,
            residencyGovIdBackBase64,
            residencyUtilityBillBase64,
            indigencyFrontBase64,
            indigencyBackBase64,
            goodMoralGovIdFrontBase64,
            goodMoralGovIdBackBase64,
            goodMoralProofOfResidencyBase64,
            goodMoralCommunityTaxCertBase64,
        ] = await Promise.all([
            toBase64(requestData.frontIdFile),
            toBase64(requestData.backIdFile),
            toBase64(requestData.residencyFiles?.govIdFront),
            toBase64(requestData.residencyFiles?.govIdBack),
            toBase64(requestData.residencyFiles?.utilityBill),
            toBase64(requestData.indigencyFiles?.front),
            toBase64(requestData.indigencyFiles?.back),
            toBase64(requestData.goodMoralFiles?.govIdFront),
            toBase64(requestData.goodMoralFiles?.govIdBack),
            toBase64(requestData.goodMoralFiles?.proofOfResidency),
            toBase64(requestData.goodMoralFiles?.communityTaxCert),
        ]);

        // Simulate API call delay
        setTimeout(() => {
            const newRequest = {
                ...requestData,
                id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                date: Date.now(),
                status: "Pending",
                requester: "Benjie Cabajar", // Placeholder
            };

            // Attach the correct base64 images based on certificate type
            if (newRequest.type === 'Barangay Clearance') {
                newRequest.frontIdImage = frontIdImageBase64;
                newRequest.backIdImage = backIdImageBase64;
            } else if (newRequest.type === 'Certificate of Residency') {
                newRequest.frontIdImage = residencyGovIdFrontBase64;
                newRequest.backIdImage = residencyGovIdBackBase64;
                newRequest.utilityBillImage = residencyUtilityBillBase64;
            } else if (newRequest.type === 'Certificate of Indigency') {
                newRequest.frontIdImage = indigencyFrontBase64;
                newRequest.backIdImage = indigencyBackBase64;
            } else if (newRequest.type === 'Certificate of Good Moral Character') {
                newRequest.frontIdImage = goodMoralGovIdFrontBase64;
                newRequest.backIdImage = goodMoralGovIdBackBase64;
                newRequest.proofOfResidencyImage = goodMoralProofOfResidencyBase64;
                newRequest.communityTaxCertImage = goodMoralCommunityTaxCertBase64;
            }

            // Clean up raw file objects
            delete newRequest.frontIdFile;
            delete newRequest.backIdFile;
            delete newRequest.residencyFiles;
            delete newRequest.indigencyFiles;
            delete newRequest.goodMoralFiles;

            const currentRequests = JSON.parse(localStorage.getItem('certificationRequests')) || [];
            localStorage.setItem('certificationRequests', JSON.stringify([newRequest, ...currentRequests]));

            const modNotif = { id: Date.now() + 2, type: 'new_cert_request', message: `A new "${newRequest.type}" has been requested.`, requestId: newRequest.id, isRead: false, date: Date.now() };
            const currentModNotifs = JSON.parse(localStorage.getItem('moderatorNotifications')) || [];
            localStorage.setItem('moderatorNotifications', JSON.stringify([modNotif, ...currentModNotifs]));

            logAuditAction('Submitted Certificate Request', { certId: newRequest.id, type: newRequest.type }, 'resident');
            setCertSubmissionStatus('success');

            setTimeout(() => {
                setIsCertModalOpen(false);
                setCertSubmissionStatus(null);
            }, 1500);
        }, 1500);
    } catch (error) {
        console.error("Certificate request submission failed:", error);
        setCertSubmissionStatus('error');
    }
  };

  const handleOpenCertModal = () => {
    setIsCertModalOpen(true);
  };

  const handleOpenViewReports = () => {
    setIsViewReportsModalOpen(true);
    // Mark all report-related notifications as read when opening the modal
    const updatedNotifications = notifications.map(n => 
      n.type === 'report_update' ? { ...n, isRead: true } : n
    );
    setNotifications(updatedNotifications);
  };

  const handleOpenNotifications = () => {
    setIsNotificationModalOpen(true);
    // Mark all notifications as read when the modal is opened
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updatedNotifications);
    // The useEffect hook will save this change to localStorage
  };

  const handleClearNotifications = () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
        setNotificationClearStatus('clearing');
        setTimeout(() => {
            setNotifications([]);
            setNotificationClearStatus('success');
            setTimeout(() => {
                setNotificationClearStatus(null);
                setIsNotificationModalOpen(false);
            }, 1000);
        }, 1500);
    }
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleMarkAsRead = (messageId) => {
    const updatedMessages = inboxMessages.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    );
    setInboxMessages(updatedMessages);
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
        const updatedMessages = inboxMessages.filter(msg => msg.id !== messageId);
        setInboxMessages(updatedMessages);
    }
  };

  const handleClearInbox = () => {
    if (window.confirm("Are you sure you want to clear all messages from your inbox?")) {
        setInboxClearStatus('clearing');
        setTimeout(() => {
            setInboxMessages([]);
            setInboxClearStatus(null);
            setIsInboxModalOpen(false);
        }, 1000);
    }
  };


  const handleLogout = () => {
    console.log("Logging out...");
    navigate("/login");
  };

  // --- Image Preview Modal Logic (Moved from ViewReportsModal) ---
  const openImageModal = (allImages, index) => {
    setModalImages(allImages);
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };



  const closeImageModal = () => setIsImageModalOpen(false);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % modalImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + modalImages.length) % modalImages.length);

  // --- Image Rendering Logic ---
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
          <div className="image-count-overlay" onClick={() => onClickFunction(postImages, 3)}>
            <span>+{totalImages - 3}</span>
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
          <button className="close-btn" onClick={closeImageModal}><FaTimes /></button>
          <img src={modalImages[currentImageIndex]} alt={`Preview ${currentImageIndex + 1}`} className="modal-image" />
          {modalImages.length > 1 && (
            <>
              <button className="nav-btn prev-btn" onClick={prevImage}><FaChevronLeft size={30} /></button>
              <button className="nav-btn next-btn" onClick={nextImage}><FaChevronRight size={30} /></button>
            </>
          )}
          <div className="image-counter">
            {currentImageIndex + 1} of {modalImages.length}
          </div>
        </div>
      </div>
    );
  };

  const handleDateClick = (clickedDate) => {
    setDate(clickedDate);
    const dateString = clickedDate.toISOString().split('T')[0];
    const dayEvents = events.filter(event => event.date === dateString);

    if (dayEvents.length > 0) {
      setEventsForModal(dayEvents);
      setIsViewEventsModalOpen(true);
    }
  };

  const handleTileMouseEnter = (date) => {
    clearTimeout(hoverTimeoutRef.current);
    const dateString = date.toISOString().split('T')[0];
    const dayEvents = events.filter(event => event.date === dateString);

    if (dayEvents.length > 0) {
      hoverTimeoutRef.current = setTimeout(() => {
        setEventsForModal(dayEvents);
        setHoveredDate(date);
        setIsViewEventsModalOpen(true);
      }, 500); // 500ms delay before showing modal
    }
  };

  const handleTileMouseLeave = () => {
    clearTimeout(hoverTimeoutRef.current);
  };

  const handleModalMouseLeave = () => {
    // Optional: close modal when mouse leaves it
    // For better UX, we can leave it open until the user explicitly closes it.
    // If you want it to close, uncomment the line below.
    // setIsViewEventsModalOpen(false);
  };

  // Helper to format time from 'HH:mm' to 'h:mm A'
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // --- Event Logic for Resident View ---
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the beginning of today
    // The `new Date(event.date)` can have timezone issues.
    // Adding 'T00:00:00' makes it explicit that it's local time midnight.
    return events
        .filter(event => {
            const eventDate = new Date(`${event.date}T00:00:00`);
            return eventDate >= today;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

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
          const dayEvents = events.filter(event => event.date === dateString);

          if (dayEvents.length > 0) {
              return (
                  <>
                      <div className="event-dot"></div>
                      <div className="event-tooltip">
                          {dayEvents.map(event => (
                              <div key={event.id} className="event-tooltip-item">
                                  <strong>{event.title}</strong>
                                  {event.description && <p>{event.description}</p>}
                              </div>
                          ))}
                      </div>
                  </>
              );
          }
      }
      return null;
  };
  // This is the same component from modal-view-reports, now rendered here
  const ReportImagePreviewModal = ({ isOpen, onClose, images, startIndex }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    if (!isOpen) return null;

    const next = (e) => { e.stopPropagation(); setCurrentIndex(p => (p + 1) % images.length); };
    const prev = (e) => { e.stopPropagation(); setCurrentIndex(p => (p - 1 + images.length) % images.length); };

    return (
      <div className="preview-modal-overlay" onClick={onClose}>
        <button className="preview-close-btn" onClick={onClose}><FaTimes /></button>
        <img src={images[currentIndex]} alt={`Preview ${currentIndex + 1}`} className="modal-image" />
        {images.length > 1 && (
          <>
            <button className="nav-btn prev-btn" onClick={prev}><FaChevronLeft size={30} /></button>
            <button className="nav-btn next-btn" onClick={next}><FaChevronRight size={30} /></button>
          </>
        )}
      </div>
    );
  };

  return (
    <ThemeProvider>
      <div className="home-page">
      <ImagePreviewModal />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onLogout={handleLogout}
      />

      <SettingModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        role="residenta"
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSubmissionStatus(null); 
        }}
        onSubmit={handleReportSubmit}
        submissionStatus={submissionStatus}
      />

      <ViewReportsModal
        isOpen={isViewReportsModalOpen}
        onClose={() => setIsViewReportsModalOpen(false)}
        reports={userReports}
        onCancelReport={handleCancelReport}
        onDeleteReport={handleDeleteReport}
        onOpenImage={openImageModal}
      />

      <ReportImagePreviewModal
        isOpen={isImageModalOpen}
        onClose={closeImageModal}
        images={modalImages}
        startIndex={currentImageIndex}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        onClear={handleClearNotifications}
        onDelete={handleDeleteNotification}
        submissionStatus={notificationClearStatus}
      />

      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        onReportUser={handleReportUserSubmit}
        initialReportedUser={reportingUser}
      />

      <RequestCertificationModal
        isOpen={isCertModalOpen}
        onClose={() => {
          setIsCertModalOpen(false);
          setCertSubmissionStatus(null); // Reset submission status when modal closes
        }}
        onSubmit={handleCertRequestSubmit}
        submissionStatus={certSubmissionStatus}
      />

      <ViewEventsModal
        isOpen={isViewEventsModalOpen}
        onClose={() => setIsViewEventsModalOpen(false)}
        events={eventsForModal}
        date={date}
      />

      <InboxModal
        isOpen={isInboxModalOpen}
        onClose={() => setIsInboxModalOpen(false)}
        messages={inboxMessages}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDeleteMessage}
        onClearAll={handleClearInbox}
        submissionStatus={inboxClearStatus}
      />

      {/* ✅ Using your Header.jsx */}
      <Header/>

      <div className="content">
        {/* Left Sidebar */}
        <aside className="left-panel">
          <div className="side-buttons">
            <button className="sidebar-btn orange" onClick={() => setIsProfileModalOpen(true)}>
              <FaUser size={30} />
              <span>Profile</span>
            </button>

            <button className="sidebar-btn blue notification-bell-btn" onClick={handleOpenNotifications}>
              <FaBell size={30} />
              <span>Notifications</span>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="notification-badge">{notifications.filter(n => !n.isRead).length}</span>
              )}
            </button>

            <button className="sidebar-btn soft-blue notfication-bell-btn" onClick={() => setIsInboxModalOpen(true)}>
              <FaInbox size={30} />
              <span>Inbox</span>
              {inboxMessages.filter(m => !m.isRead).length > 0 && (
                <span className="notification-badge">{inboxMessages.filter(m => !m.isRead).length}</span>
              )}
            </button>

            <button className="sidebar-btn purple"
              onClick={handleOpenViewReports}>
              <FaClipboardList size={30} />
              <span>View and Track Reports</span>
              {notifications.filter(n => n.type === 'report_update' && !n.isRead).length > 0 && (
                <span className="notification-badge">{notifications.filter(n => n.type === 'report_update' && !n.isRead).length}</span>
              )}
            </button>

            <button className="sidebar-btn teal" onClick={handleOpenCertModal}>
              <MdOutlineAssignment size={30} />
              <span>Request Certification</span>
            </button>

            <button className="sidebar-btn red" onClick={() => setIsReportModalOpen(true)}>
              <FaFileAlt size={30} />
              <span>File a Report</span>
            </button>


            <button
              className="sidebar-btn green"
              onClick={() => setIsSupportModalOpen(true)}
            >
              <FaHeadset size={30} />
              <span>Support</span>
            </button>

            <button className="sidebar-btn gray"
              onClick={() => setIsSettingsModalOpen(true)}>
              <FaCog size={30} />
              <span>Settings</span>
            </button>

          </div>
        </aside>

        {/* Main Feed */}
        <main className="main-content">
          {processedPosts.length > 0 || filterCategory !== 'All' ? (
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
              {processedPosts.length > 0 ? processedPosts.map((post) => (
                <div className="update-card" key={post.id}>
                  <div className="post-header">
                    <img src={post.authorAvatar} alt="author avatar" className="author-avatar" />
                    <div className="post-info">
                      <span className="author-name">{post.author}</span>
                      <span className="post-time">
                        {post.category && (
                            <span className={`post-category-badge ${getCategoryClass(post.category)}`}>{post.category}</span>
                        )}
                        {new Date(post.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <button className="options-btn" title="Post Options">
                      <FaEllipsisH size={18} />
                    </button>
                  </div>

                  {post.title && <p className="update-title">{post.title}</p>}
                  <p className="update-description">{post.description}</p>

                  {post.images && post.images.length > 0 && renderPostImages(post.images, openImageModal)}

                  <div style={{ borderTop: '1px solid #e5e7eb', margin: '15px 0 0 0' }}></div>

                  <CommentSection 
                    postId={post.id} 
                    comments={post.comments || []} 
                    handleAddComment={handleAddComment}
                    onEditComment={handleEditComment}
                    currentUser="Resident User"
                    onDeleteComment={handleDeleteComment}
                    onReportComment={handleReportComment} />
                </div>
              )) : (
                <div className="no-announcements" style={{ marginTop: '20px' }}>
                  <h3>No Announcements Found</h3>
                  <p>There are no announcements matching the selected category.</p>
                </div>
              )}
            </>
          ) : (
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
        </main>

        {/* Right Panel */}
        <aside className="right-panel">
          <div className="calendar-box">
            <h4>CALENDAR</h4>
            <Calendar 
              value={date} 
              tileContent={tileContent}
              onClickDay={handleDateClick}
            />
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
                    <div key={event.id} className={eventClasses} onClick={() => handleDateClick(new Date(event.date))}>
                      <div className="event-item-header">
                        <p className="event-item-title">{event.title}</p>
                        {isHappeningNow && <span className="live-badge">Ongoing</span>}
                        {hasEnded && <span className="live-badge ended" style={{ backgroundColor: '#ef4444' } }>Ended</span>}
                      </div>
                      {event.description && <p className="event-item-desc">{event.description}</p>}
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

export default Home;