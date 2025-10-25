import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaHeadset, FaChevronDown, FaChevronUp, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import '../styles/m-support-modal.css';

const AccordionItem = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="accordion-item">
            <button className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
                <span>{title}</span>
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {isOpen && <div className="accordion-content">{children}</div>}
        </div>
    );
};

const SupportModal = ({ isOpen, onClose, onReportUser, initialReportedUser }) => {
    if (!isOpen) return null;

    const [reportedUserName, setReportedUserName] = useState('');
    const [reportReason, setReportReason] = useState('');
    const reportSectionRef = useRef(null);

    // State for the new contact form
    const [isContactFormVisible, setIsContactFormVisible] = useState(false);
    const [issueType, setIssueType] = useState('');
    const [issueDescription, setIssueDescription] = useState('');
    const [contactSubmissionStatus, setContactSubmissionStatus] = useState(null);

    const ISSUE_TYPES = ['Technical Bug', 'Feature Request', 'Account Issue', 'General Inquiry', 'Other'];


    useEffect(() => {
        if (isOpen) {
            setReportedUserName(initialReportedUser || '');
            setReportReason(''); // Always clear reason

            if (initialReportedUser && reportSectionRef.current) {
                // Use a timeout to ensure the modal is fully rendered before scrolling
                setTimeout(() => {
                    reportSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
    }, [isOpen, initialReportedUser]);

    const faqs = [
        {
            q: "How do I manage announcements?",
            a: "You can create new announcements using the 'Create Announcement' button. To edit or delete an existing post, click the three-dot menu on the top-right of the post card in the feed."
        },
        {
            q: "What is the process for certificate requests?",
            a: "When a resident requests a certificate, it appears in the 'Pending' tab of the 'Certificate Requests' modal. You can review the details, including any provided IDs, and then choose to 'Approve' or 'Decline' the request."
        },
        {
            q: "What happens when I approve a certificate?",
            a: "Approving a request sends a notification to the resident and places a printable version of the certificate in their inbox."
        },
        {
            q: "How do I handle resident reports?",
            a: "Open the 'Resident Reports' modal to view all submitted reports. You can update the status of a report (e.g., to 'Reviewed' or 'In Progress'), which will notify the resident of the change."
        },
        {
            q: "How do events work?",
            a: "You can add events to the calendar, which will appear in the 'Upcoming Events' list for all users. Events that have passed are automatically removed, and users are notified when an event has ended."
        }
    ];

    const handleReportSubmit = (e) => {
        e.preventDefault();
        if (reportedUserName.trim() && reportReason.trim()) {
            onReportUser(reportedUserName, reportReason);
            setReportedUserName('');
            setReportReason('');
        }
    };

    const handleContactAdminSubmit = (e) => {
        e.preventDefault();
        if (issueType && issueDescription.trim()) {
            setContactSubmissionStatus('submitting');
            console.log('Submitting to admin:', { issueType, issueDescription });
            // Simulate API call
            setTimeout(() => {
                setContactSubmissionStatus('success');
                setTimeout(() => {
                    setIsContactFormVisible(false);
                    setIssueType('');
                    setIssueDescription('');
                    setContactSubmissionStatus(null);
                }, 2000);
            }, 1500);
        }
    };

    return (
        <div className="support-modal-overlay" onClick={onClose}>
            <div className="support-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Support & Help Center</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes size={20} /></button>
                </div>

                <div className="support-body">
                    <div className="support-icon-container">
                        <FaHeadset size={40} />
                    </div>
                    <h3>Frequently Asked Questions</h3>
                    <div className="faq-container">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} title={faq.q}>
                                <p>{faq.a}</p>
                            </AccordionItem>
                        ))}
                    </div>

                    <div className="report-user-section" ref={reportSectionRef}>
                        <h4><FaExclamationTriangle /> Report a Resident</h4>
                        <p>If a resident is violating community guidelines outside of the comments section, you can report them directly to the administrator here.</p>
                        <form onSubmit={handleReportSubmit}>
                            <div className="form-group">
                                <label htmlFor="resident-name">Resident's Full Name</label>
                                <input
                                    id="resident-name"
                                    type="text"
                                    value={reportedUserName}
                                    onChange={(e) => setReportedUserName(e.target.value)}
                                    placeholder="Enter the full name of the resident"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="report-reason">Reason for Reporting</label>
                                <textarea
                                    id="report-reason"
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    placeholder="Describe the issue or violation..."
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="report-submit-btn" disabled={!reportedUserName.trim() || !reportReason.trim()}>Submit Report to Admin</button>
                        </form>
                    </div>

                    <div className="contact-support-section">
                        <h4>Need More Help?</h4>
                        <p>If you're experiencing a technical issue or have a question not answered above, please contact the system administrator.</p>
                        {!isContactFormVisible ? (
                            <button onClick={() => setIsContactFormVisible(true)} className="contact-btn">
                                Contact Administrator
                            </button>
                        ) : (
                            contactSubmissionStatus === 'success' ? (
                                <div className="contact-success-message">
                                    <FaCheckCircle /> Your message has been sent. The administrator will get back to you shortly.
                                </div>
                            ) : (
                                <form onSubmit={handleContactAdminSubmit} className="contact-admin-form">
                                    <div className="form-group">
                                        <label htmlFor="issue-type-moderator">Issue Type</label>
                                        <select id="issue-type-moderator" value={issueType} onChange={(e) => setIssueType(e.target.value)} required>
                                            <option value="" disabled>Select an issue type...</option>
                                            {ISSUE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="issue-description-moderator">Description</label>
                                        <textarea
                                            id="issue-description-moderator"
                                            value={issueDescription}
                                            onChange={(e) => setIssueDescription(e.target.value)}
                                            placeholder="Please describe in detail..."
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="contact-form-actions">
                                        <button type="button" className="cancel-contact-btn" onClick={() => setIsContactFormVisible(false)}>Cancel</button>
                                        <button type="submit" className="submit-contact-btn" disabled={!issueType || !issueDescription.trim() || contactSubmissionStatus === 'submitting'}>
                                            {contactSubmissionStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </div>
                                </form>
                            )
                        )}
                    </div>

                    <div className="system-info-footer">
                        <span>App Version: 1.0.0</span>
                        <span>Role: Moderator</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportModal;