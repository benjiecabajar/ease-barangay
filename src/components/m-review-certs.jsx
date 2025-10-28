import React, { useState, useEffect } from 'react';
import { FaTimes, FaRegSadTear, FaEye, FaBan, FaCheckCircle, FaChevronLeft, FaTrash, FaSyncAlt } from 'react-icons/fa';
import '../styles/m-review-certs.css';

const StatusBadge = ({ status }) => {
    const statusInfo = {
        Pending: { label: "🟡 Pending", className: "status-pending" },
        Approved: { label: "🟢 Approved", className: "status-approved" },
        Declined: { label: "🔴 Declined", className: "status-declined" },
        Canceled: { label: "⚪ Canceled", className: "status-canceled" },
    };
    const { label, className } = statusInfo[status] || { label: status, className: "status-default" };
    return <span className={`status-badge ${className}`}>{label}</span>;
};

const ReviewCertsModal = ({ isOpen, onClose, requests, onUpdateStatus, onDeleteRequest }) => {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [activeTab, setActiveTab] = useState('Pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [loadingAction, setLoadingAction] = useState(null); // null, 'approving', 'declining', 'deleting'

    const handleStatusUpdate = (newStatus) => {
        if (selectedRequest) {
            const action = newStatus === 'Approved' ? 'approve' : 'decline';
            if (window.confirm(`Are you sure you want to ${action} this request?`)) {
                setLoadingAction(action); // 'approve' or 'decline'
                // Simulate API call
                setTimeout(() => {
                    onUpdateStatus(selectedRequest.id, newStatus);
                    setLoadingAction(null);

                    // After updating the status, go back to the list view
                    // to reflect that the item has moved out of the "Pending" queue.
                    if (newStatus === 'Approved' || newStatus === 'Declined') {
                        setSelectedRequest(null);
                    } else {
                        setSelectedRequest(prev => ({ ...prev, status: newStatus }));
                    }
                }, 1500);
            }
        }
    };

    // This effect ensures that if the underlying request data changes (e.g., status update),
    // the detailed view is updated with the latest information.
    useEffect(() => {
        if (selectedRequest) {
            const updatedRequest = requests.find(r => r.id === selectedRequest.id);
            if (updatedRequest) setSelectedRequest(updatedRequest);
        }
    }, [requests, selectedRequest]);

    if (!isOpen) return null;

    const handleDeleteClick = () => {
        if (selectedRequest) {
            if (window.confirm("Are you sure you want to permanently delete this request?")) {
                setLoadingAction('deleting');
                // Simulate API call
                setTimeout(() => {
                    onDeleteRequest(selectedRequest.id);
                    setLoadingAction(null);
                    setSelectedRequest(null); // Go back to the list view
                }, 1500);
            }
        }
    };

    const renderRequestList = (requestList, emptyMessage) => {
        if (requests.length === 0) {
            return (
                <div className="no-items-placeholder">
                    <FaRegSadTear size={50} />
                    <h3>No Certificate Requests</h3>
                    <p>New requests from residents will appear here.</p>
                </div>
            );
        }
        if (requestList.length > 0) {
            return requestList.map(req => (
                <CertCard key={req.id} req={req} onClick={() => setSelectedRequest(req)} />
            ));
        }
        return <p className="empty-category-message">{emptyMessage}</p>;
    };

    // --- Filtering Logic ---
    const certTypes = ['All', ...new Set(requests.map(r => r.type))];
    const filteredRequests = requests.filter(req => {
        const matchesSearch = searchTerm === '' || req.requester.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || req.type === filterType;
        return matchesSearch && matchesType;
    });

    // --- Categorization Logic (uses filtered requests) ---
    const pendingRequests = filteredRequests.filter(req => req.status === 'Pending').sort((a, b) => b.date - a.date);
    const approvedRequests = filteredRequests.filter(req => req.status === 'Approved').sort((a, b) => b.date - a.date);
    const declinedRequests = filteredRequests.filter(req => req.status === 'Declined').sort((a, b) => b.date - a.date);
    const canceledRequests = filteredRequests.filter(req => req.status === 'Canceled').sort((a, b) => b.date - a.date);

    return (
        <div className="view-certs-modal-overlay" onClick={onClose}>
            <div className="view-certs-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{selectedRequest ? "Review Certificate Request" : "Certificate Requests"}</h2>
                    {loadingAction && (
                        <div className="submission-overlay">
                            <div className="spinner"></div>
                            <p>
                                {loadingAction === 'approve' && 'Approving Request...'}
                                {loadingAction === 'decline' && 'Declining Request...'}
                                {loadingAction === 'deleting' && 'Deleting Request...'}
                            </p>
                        </div>
                    )}
                    <button className="close-btn" onClick={onClose}><FaTimes size={20} /></button>
                </div>

                <div className="certs-body">
                    {!selectedRequest ? (
                        // List View with Tabs
                        <>
                            <div className="filter-bar">
                                <input
                                  type="text"
                                  placeholder="Search by requester name..."
                                  className="filter-search"
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <select
                                  className="filter-select"
                                  value={filterType}
                                  onChange={(e) => setFilterType(e.target.value)}
                                >
                                  {certTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                            </div>
                            <div className="certs-tabs">
                                <button
                                    className={`tab-btn ${activeTab === 'Pending' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('Pending')}
                                >
                                    Pending ({pendingRequests.length})
                                </button>
                                <button
                                    className={`tab-btn ${activeTab === 'Approved' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('Approved')}
                                >
                                    Approved ({approvedRequests.length})
                                </button>
                                <button
                                    className={`tab-btn ${activeTab === 'Declined' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('Declined')}
                                >
                                    Declined ({declinedRequests.length})
                                </button>
                                <button
                                    className={`tab-btn ${activeTab === 'Canceled' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('Canceled')}
                                >
                                    Canceled ({canceledRequests.length})
                                </button>
                            </div>
                            <div className="certs-tab-content">
                                {activeTab === 'Pending' && renderRequestList(pendingRequests, "No pending requests.")}
                                {activeTab === 'Approved' && renderRequestList(approvedRequests, "No approved requests.")}
                                {activeTab === 'Declined' && renderRequestList(declinedRequests, "No declined requests.")}
                                {activeTab === 'Canceled' && renderRequestList(canceledRequests, "No canceled requests.")}
                            </div>
                        </>
                    ) : (
                        // Detail View
                        <div className="details-body">
                            <button className="back-to-list-btn" onClick={() => setSelectedRequest(null)}>
                                <FaChevronLeft /> Back to List
                            </button>
                            {selectedRequest.details && (
                                <p>
                                    <strong>Requester Name:</strong> {`${selectedRequest.details.firstName} ${selectedRequest.details.middleName || ''} ${selectedRequest.details.lastName}`.trim()}
                                </p>
                            )}
                            <p><strong>Certificate Type:</strong> {selectedRequest.type}</p>
                            <p><strong>Purpose:</strong> {selectedRequest.purpose}</p>
                            <p><strong>Date Requested:</strong> {new Date(selectedRequest.date).toLocaleString()}</p>
                            <p><strong>Current Status:</strong> <StatusBadge status={selectedRequest.status} /></p>

                            {/* Display Resident's ID */}
                            {(selectedRequest.frontIdImage || selectedRequest.backIdImage || selectedRequest.utilityBillImage || selectedRequest.proofOfResidencyImage || selectedRequest.communityTaxCertImage) && (
                                <div className="id-images-container">
                                    <h4>Provided Attachments:</h4>
                                    <div className="id-image-wrapper">
                                        {selectedRequest.frontIdImage && (
                                            <div className="id-image-item">
                                                <p>Valid ID (Front)</p>
                                                <img src={selectedRequest.frontIdImage} alt="Front of ID" />
                                            </div>
                                        )}
                                        {selectedRequest.backIdImage && (
                                            <div className="id-image-item">
                                                <p>Valid ID (Back)</p>
                                                <img src={selectedRequest.backIdImage} alt="Back of ID" />
                                            </div>
                                        )}
                                        {selectedRequest.utilityBillImage && (
                                            <div className="id-image-item">
                                                <p>Utility Bill</p>
                                                <img src={selectedRequest.utilityBillImage} alt="Utility Bill" />
                                            </div>
                                        )}
                                        {selectedRequest.proofOfResidencyImage && (
                                            <div className="id-image-item">
                                                <p>Proof of Residency</p>
                                                <img src={selectedRequest.proofOfResidencyImage} alt="Proof of Residency" />
                                            </div>
                                        )}
                                        {selectedRequest.communityTaxCertImage && (
                                            <div className="id-image-item">
                                                <p>Community Tax Certificate</p>
                                                <img src={selectedRequest.communityTaxCertImage} alt="Community Tax Certificate" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Show Approve/Decline for pending requests */}
                            {selectedRequest.status === 'Pending' && (
                                <div className="moderator-actions">
                                    <p>Actions:</p>
                                    <div className="primary-actions">
                                        <button
                                            className="action-btn approve"
                                            onClick={() => handleStatusUpdate('Approved')}
                                        >
                                            <FaCheckCircle /> Approve
                                        </button>
                                        <button
                                            className="action-btn decline"
                                            onClick={() => handleStatusUpdate('Declined')}
                                        >
                                            <FaBan /> Decline
                                        </button>
                                    </div>
                                </div>
                            )}
                            {/* Show Delete for any non-pending requests */}
                            {['Approved', 'Declined', 'Canceled'].includes(selectedRequest.status) && (
                                <button className="delete-report-btn permanent-delete" onClick={handleDeleteClick}>
                                    <FaTrash /> Permanently Delete Request
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CertCard = ({ req, onClick }) => (
    <div className="cert-card clickable" onClick={onClick}>
        <div className="cert-card-header">
            <h3>{req.type}</h3>
            <FaEye className="view-icon" />
        </div>
        <p className="cert-card-requester">
            Requester: {req.details ? `${req.details.firstName} ${req.details.lastName}` : req.requester}
        </p>
        <div className="cert-card-footer">
            <StatusBadge status={req.status} />
            <small className="cert-date">
                {new Date(req.date).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
            </small>
        </div>
    </div>
);


export default ReviewCertsModal;