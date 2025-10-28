import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaHeadset, FaChevronDown, FaChevronUp, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import '../styles/r-support-modal.css';

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

    // State for the new contact form
    const [isContactFormVisible, setIsContactFormVisible] = useState(false);
    const [issueType, setIssueType] = useState('');
    const [issueDescription, setIssueDescription] = useState('');
    const [contactSubmissionStatus, setContactSubmissionStatus] = useState(null);

    const ISSUE_TYPES = ['Technical Bug', 'Feature Request', 'Account Issue', 'General Inquiry', 'Other'];



    // Listen for the custom event to scroll to the report section
    useEffect(() => {
        const handler = (e) => {
            if (!isOpen) return; // Only act if the modal is open
            // This handler is now empty but kept in case of future use for other events.
        };

        window.addEventListener("openSupportReport", handler);
        return () => window.removeEventListener("openSupportReport", handler);
    }, [isOpen]);

    const faqs = [
        {
            q: "How do I file a report?",
            a: "Click the 'File a Report' button on the sidebar. Fill out the form with the necessary details, attach any evidence (photos or videos), and submit. You can track its status in the 'View and Track Reports' section."
        },
        {
            q: "How can I track my submitted reports?",
            a: "Click the 'View and Track Reports' button. You will see a list of all your reports and their current status (e.g., Pending, Reviewed, In Progress, Resolved)."
        },
        {
            q: "How do I request a certificate?",
            a: "Use the 'Request Certification' button on the sidebar. Select the type of certificate you need, state your purpose, and provide any required information or ID photos."
        },
        {
            q: "Where can I find my approved certificates?",
            a: "Once a certificate request is approved by a moderator, it will appear in your 'Inbox'. You can open your inbox from the sidebar to view and print your certificates."
        },
        {
            q: "How do I find out about upcoming events?",
            a: "Upcoming events are listed on the right-hand panel of your home page. You can also click on dates in the calendar that have a dot to see events scheduled for that day."
        }
    ];

    const handleContactAdminSubmit = (e) => {
        e.preventDefault();
        if (issueType && issueDescription.trim()) {
            setContactSubmissionStatus('submitting');
            
            // Get user info to attach to the message
            const userProfile = JSON.parse(localStorage.getItem('userProfile'));

            // Get current moderator inbox and add the new message
            const moderatorInbox = JSON.parse(localStorage.getItem('moderatorInbox')) || [];
            const newInboxMessage = {
                id: `resident-inquiry-${Date.now()}`,
                subject: `Inquiry from Resident: ${issueType}`,
                body: issueDescription,
                from: userProfile?.name || 'Unknown Resident',
                userId: userProfile?.id,
                date: Date.now(),
                isRead: false,
            };
            localStorage.setItem('moderatorInbox', JSON.stringify([newInboxMessage, ...moderatorInbox]));

            // Simulate API call and UI feedback
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

    const renderContactForm = () => {
        if (contactSubmissionStatus === 'submitting') {
            return <div className="submission-overlay-local"><div className="spinner"></div><p>Sending your message...</p></div>;
        }
        if (contactSubmissionStatus === 'success') {
            return <div className="contact-success-message"><FaCheckCircle /> Your message has been sent. The administrator will get back to you shortly.</div>;
        }
        return (
            <form onSubmit={handleContactAdminSubmit} className="contact-admin-form">
                <div className="form-group">
                    <label htmlFor="issue-type">Issue Type</label>
                    <select id="issue-type" value={issueType} onChange={(e) => setIssueType(e.target.value)} required>
                        <option value="" disabled>Select an issue type...</option>
                        {ISSUE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="issue-description">Description</label>
                    <textarea id="issue-description" value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} placeholder="Please describe in detail..." required></textarea>
                </div>
                <div className="contact-form-actions">
                    <button type="button" className="cancel-contact-btn" onClick={() => setIsContactFormVisible(false)}>Cancel</button>
                    <button type="submit" className="submit-contact-btn" disabled={!issueType || !issueDescription.trim() || contactSubmissionStatus === 'submitting'}>
                        {contactSubmissionStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                    </button>
                </div>
            </form>
        );
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

                    <div className="contact-support-section">
                        <h4>Need More Help?</h4>
                        <p>If you're experiencing a technical issue or have a question not answered above, please contact the system administrator.</p>
                        {!isContactFormVisible ? (
                            <button onClick={() => setIsContactFormVisible(true)} className="contact-btn">
                                Contact Moderator
                            </button>
                        ) : renderContactForm()}
                    </div>

                    <div className="system-info-footer">
                        <span>App Version: 1.0.0</span>
                        <span>Role: Resident</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportModal;