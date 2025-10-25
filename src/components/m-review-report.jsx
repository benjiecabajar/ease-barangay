import React, { useState } from "react";
import {
  FaTimes,
  FaRegSadTear,
  FaEye,
  FaBan,
  FaCheckCircle,
  FaTools,
  FaClipboardCheck,
  FaTrash,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "../styles/modal-view-reports.css"; // Reuse the same styles

const StatusBadge = ({ status }) => {
  const statusInfo = {
    submitted: { label: "🟡 Pending Review", className: "status-submitted" },
    reviewed: { label: "🟠 Under Review", className: "status-reviewed" },
    approved: { label: "🟢 Approved", className: "status-approved" },
    "in-progress": { label: "🔵 In Progress", className: "status-in-progress" },
    done: { label: "✅ Resolved", className: "status-done" },
    declined: { label: "🔴 Declined", className: "status-declined" },
    canceled: { label: "⚪ Canceled", className: "status-canceled" },
  };
  const { label, className } = statusInfo[status] || { label: status, className: "status-default" };
  return <span className={`status-badge ${className}`}>{label}</span>;
};

const REPORT_FILTER_TYPES = [
  'All',
  'General Maintenance',
  'Safety Hazard',
  'Noise Complaint',
  'Pest Control',
  'Facilities Issue',
  'User Behavior',
];

const ReviewReportModal = ({ isOpen, onClose, reports, onUpdateReportStatus, onDeleteReport }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeTab, setActiveTab] = useState('New');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  // State for the image preview modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalImages, setModalImages] = useState([]);

  if (!isOpen) return null;

  const handleSelectReport = (report) => {
    // Immediately set the selected report for viewing
    setSelectedReport(report);
    // If the report is newly submitted, automatically update its status to "reviewed"
    if (report.status === 'submitted') {
      onUpdateReportStatus(report.id, 'reviewed');
    }
  };

  const handleStatusUpdate = (newStatus) => {
    if (selectedReport) {
      onUpdateReportStatus(selectedReport.id, newStatus);
      setSelectedReport(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleDeleteClick = () => {
    if (selectedReport) {
      onDeleteReport(selectedReport.id);
      setSelectedReport(null); // Go back to the list view after deletion
    }
  };

  // --- Image Preview Modal Logic ---
  const openImageModal = (images, index) => {
    setModalImages(images);
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => setIsImageModalOpen(false);
  const nextImage = (e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % modalImages.length); };
  const prevImage = (e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + modalImages.length) % modalImages.length); };

  // --- Filtering Logic ---
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || report.type === filterType;
    return matchesSearch && matchesType;
  });

  // --- Categorization Logic (uses filtered reports) ---
  const newReports = filteredReports.filter(r => r.status === 'submitted').sort((a, b) => b.date - a.date);
  const pendingReports = filteredReports.filter(r => ['submitted', 'reviewed'].includes(r.status)).sort((a, b) => b.date - a.date);
  const approvedReports = filteredReports.filter(r => r.status === 'approved').sort((a, b) => b.date - a.date);
  const inProgressReports = filteredReports.filter(r => r.status === 'in-progress').sort((a, b) => b.date - a.date);
  const resolvedReports = filteredReports.filter(r => r.status === 'done').sort((a, b) => b.date - a.date);
  const otherReports = filteredReports.filter(r => ['declined', 'canceled'].includes(r.status)).sort((a, b) => b.date - a.date);

  const renderReportList = (reportList, emptyMessage) => {
    if (reports.length === 0) {
        return (
            <div className="no-reports-placeholder">
                <FaRegSadTear size={50} />
                <h3>No Reports to Review</h3>
                <p>New reports from residents will appear here.</p>
            </div>
        );
    }
    return reportList.length > 0 ? reportList.map(report => <ReportCard key={report.id} report={report} onSelect={() => handleSelectReport(report)} />) : <p className="empty-category-message">{emptyMessage}</p>;
  };

  return (
    <div className="view-reports-modal-overlay" onClick={onClose}>
      <div className="view-reports-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{selectedReport ? "Review Report" : "Resident Reports"}</h2>
          <button className="close-btn" onClick={onClose}><FaTimes size={20} /></button>
        </div>

        <div className="reports-body">
          {!selectedReport ? (
            // List View
            <>
              <div className="filter-bar">
                <input
                  type="text"
                  placeholder="Search in description..."
                  className="filter-search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="filter-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  {REPORT_FILTER_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="certs-tabs">
                <button className={`tab-btn ${activeTab === 'New' ? 'active' : ''}`} onClick={() => setActiveTab('New')}>
                  New ({newReports.length})
                </button>
                <button className={`tab-btn ${activeTab === 'Pending' ? 'active' : ''}`} onClick={() => setActiveTab('Pending')}>
                  Pending ({pendingReports.length})
                </button>
                <button className={`tab-btn ${activeTab === 'Approved' ? 'active' : ''}`} onClick={() => setActiveTab('Approved')}>
                  Approved ({approvedReports.length})
                </button>
                <button className={`tab-btn ${activeTab === 'In Progress' ? 'active' : ''}`} onClick={() => setActiveTab('In Progress')}>
                  In Progress ({inProgressReports.length})
                </button>
                <button className={`tab-btn ${activeTab === 'Resolved' ? 'active' : ''}`} onClick={() => setActiveTab('Resolved')}>
                  Resolved ({resolvedReports.length})
                </button>
                <button className={`tab-btn ${activeTab === 'Other' ? 'active' : ''}`} onClick={() => setActiveTab('Other')}>
                  Declined/Canceled ({otherReports.length})
                </button>
              </div>
              <div className="certs-tab-content">
                {activeTab === 'New' && renderReportList(newReports, "No new reports.")}
                {activeTab === 'Pending' && renderReportList(pendingReports, "No pending reports.")}
                {activeTab === 'Approved' && renderReportList(approvedReports, "No approved reports.")}
                {activeTab === 'In Progress' && renderReportList(inProgressReports, "No active reports.")}
                {activeTab === 'Resolved' && renderReportList(resolvedReports, "No resolved reports.")}
                {activeTab === 'Other' && renderReportList(otherReports, "No declined or canceled reports.")}
              </div>
            </>
          ) : (
            // Detail View
            <div className="details-body" style={{ overflowY: 'auto', paddingRight: '10px' }}>
              <button className="back-to-list-btn" onClick={() => setSelectedReport(null)}>
                <FaChevronLeft /> Back to List
              </button>
              <p><strong>Description:</strong> {selectedReport.description}</p>
              <p><strong>Date Submitted:</strong> {new Date(selectedReport.date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</p>
              <p><strong>Current Status:</strong> <StatusBadge status={selectedReport.status} /></p>

              {selectedReport.location && (
                <div className="report-location-view">
                  <strong>Location:</strong> {selectedReport.location.address && <span className="location-address-text">{selectedReport.location.address}</span>}
                  <a
                    className="view-on-map-btn"
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedReport.location.lat},${selectedReport.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaMapMarkerAlt /> View on Map
                  </a>
                </div>
              )}

              {selectedReport.media && selectedReport.media.length > 0 && (
                <div className="report-media-gallery">
                  <strong>Evidence:</strong>
                  <div className="media-items">
                    {selectedReport.media.map((mediaUrl, index) => (
                      <img key={index} src={mediaUrl} alt={`Evidence ${index + 1}`} onClick={() => openImageModal(selectedReport.media, index)} />
                    ))}
                  </div>
                </div>
              )}

              <div className="moderator-actions">
                <div className="primary-actions">
                  <button 
                    className="action-btn approve" 
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={['approved', 'in-progress', 'done', 'declined', 'canceled'].includes(selectedReport.status)}
                  ><FaCheckCircle /> Approve</button>
                  <button 
                    className="action-btn decline" 
                    onClick={() => handleStatusUpdate('declined')}
                    disabled={['done', 'declined', 'canceled'].includes(selectedReport.status)}
                  ><FaBan /> Decline</button>
                </div>
                <div className="secondary-actions">
                  <button 
                    className="action-btn progress" 
                    onClick={() => handleStatusUpdate('in-progress')}
                    disabled={!['approved'].includes(selectedReport.status) || selectedReport.status === 'canceled'}
                  ><FaTools /> Mark as In Progress</button>
                  <button 
                    className="action-btn resolve" 
                    onClick={() => handleStatusUpdate('done')}
                    disabled={!['approved', 'in-progress'].includes(selectedReport.status) || selectedReport.status === 'canceled'}
                  ><FaClipboardCheck /> Mark Resolved</button>
                </div>
                {/* --- NEW: Permanent Delete Button --- */}
                {['done', 'declined', 'canceled'].includes(selectedReport.status) && (
                  <button className="delete-report-btn permanent-delete" onClick={handleDeleteClick}>
                    <FaTrash /> Permanently Delete Report
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isImageModalOpen && (
        <div className="preview-modal-overlay" onClick={closeImageModal}>
          <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="preview-close-btn" onClick={closeImageModal}><FaTimes /></button>
            <img src={modalImages[currentImageIndex]} alt={`Preview ${currentImageIndex + 1}`} className="modal-image" />
            {modalImages.length > 1 && (
              <>
                <button className="nav-btn prev-btn" onClick={prevImage}><FaChevronLeft size={30} /></button>
                <button className="nav-btn next-btn" onClick={nextImage}><FaChevronRight size={30} /></button>
              </>
            )}
            <div className="image-counter">{currentImageIndex + 1} of {modalImages.length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const ReportCard = ({ report, onSelect }) => (
    <div className="report-card clickable" onClick={onSelect}>
        <div className="report-card-header">
            <h3>{report.type}</h3>
            <FaEye className="view-icon" />
        </div>
        <p className="report-card-description">{report.description.slice(0, 100)}...</p>
        <div className="report-card-footer">
            <StatusBadge status={report.status} />
            <small className="report-date">
                {new Date(report.date).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
            </small>
        </div>
    </div>
);

export default ReviewReportModal;