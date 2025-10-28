import React, { useState, useEffect } from 'react';
import { FaCog, FaDatabase, FaPlug, FaPlus, FaTrash } from 'react-icons/fa';
import { logAuditAction } from '../utils/auditLogger';
import '../styles/system-settings-modal.css';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-content system-settings-modal" onClick={(e) => e.stopPropagation()}>
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

const EditableList = ({ title, items, onAdd, onRemove, onSelectItem, selectedItem }) => {
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
        if (!newItem.trim()) return;
        onAdd(newItem.trim());
        setNewItem('');
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent page reload
        handleAdd();
    };

    return (
        <div className="editable-list-section">
            <h4>{title}</h4>
            <ul className="editable-list">
                {items.map((item, index) => (
                    <li 
                        key={index} 
                        className={selectedItem === item ? 'selected' : ''}
                        onClick={() => onSelectItem && onSelectItem(item)}
                    >
                        <span className="item-name">{item}</span>
                        <button onClick={() => onRemove(item)}><FaTrash /></button>
                    </li>
                ))}
            </ul>
            <form className="add-item-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={`New ${title.slice(0, -1)}...`}
                />
                <button type="submit"><FaPlus /> Add</button>
            </form>
        </div>
    );
};

const SystemSettingsModal = ({ isOpen, onClose, settings, setSettings }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [termsContent, setTermsContent] = useState('');
    const [selectedMunicipality, setSelectedMunicipality] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setTermsContent(settings.termsAndConditions || '');
        }
    }, [isOpen, settings]);

    useEffect(() => {
        // If the selected municipality is removed from settings, deselect it
        if (selectedMunicipality && settings.locations && !settings.locations[selectedMunicipality]) {
            setSelectedMunicipality(null);
        }
    }, [settings, selectedMunicipality]);


    const handleSettingChange = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem('system_settings', JSON.stringify(newSettings));
        logAuditAction('System Setting Changed', { setting: key }, 'admin');
    };

    const handleAddItem = (key, item) => {
        const currentItems = settings[key] || [];
        if (!currentItems.includes(item)) {
            handleSettingChange(key, [...currentItems, item]);
        }
    };

    const handleRemoveItem = (key, itemToRemove) => {
        const currentItems = settings[key] || [];
        handleSettingChange(key, currentItems.filter(item => item !== itemToRemove));
    };

    const handleAddMunicipality = (municipality) => {
        const currentLocations = settings.locations || {};
        if (!currentLocations[municipality]) {
            handleSettingChange('locations', { ...currentLocations, [municipality]: [] });
        }
    };

    const handleRemoveMunicipality = (municipality) => {
        if (window.confirm(`Are you sure you want to remove the municipality "${municipality}" and all its barangays?`)) {
            const { [municipality]: _, ...remainingLocations } = settings.locations || {};
            handleSettingChange('locations', remainingLocations);
        }
    };

    const handleAddBarangay = (barangay) => {
        const currentLocations = settings.locations || {};
        const currentBarangays = currentLocations[selectedMunicipality] || [];
        if (!currentBarangays.includes(barangay)) {
            const newBarangays = [...currentBarangays, barangay];
            const newLocations = { ...currentLocations, [selectedMunicipality]: newBarangays };
            handleSettingChange('locations', newLocations);
        }
    };

    const handleSaveTerms = () => {
        handleSettingChange('termsAndConditions', termsContent);
        alert('Terms and Conditions have been updated.');
    };

    const handlePurgeAnnouncements = () => {
        if (window.confirm("Are you sure you want to delete all announcements older than one year? This action cannot be undone.")) {
            const allAnnouncements = JSON.parse(localStorage.getItem('announcements')) || [];
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

            const recentAnnouncements = allAnnouncements.filter(post => new Date(post.date) >= oneYearAgo);
            localStorage.setItem('announcements', JSON.stringify(recentAnnouncements));
            logAuditAction('Purged Old Announcements', {}, 'admin');
            alert(`${allAnnouncements.length - recentAnnouncements.length} old announcements have been purged.`);
        }
    };

    const handlePurgeArchivedReports = () => {
        if (window.confirm("Are you sure you want to clear all archived reports? This action cannot be undone.")) {
            const allReports = JSON.parse(localStorage.getItem('userReports')) || [];
            const activeReports = allReports.filter(report => !report.status.includes('archived'));
            localStorage.setItem('userReports', JSON.stringify(activeReports));
            logAuditAction('Purged Archived Reports', {}, 'admin');
            alert(`${allReports.length - activeReports.length} archived reports have been purged.`);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="System Configuration & Settings">
            <div className="system-settings-tabs">
                <button onClick={() => setActiveTab('general')} className={activeTab === 'general' ? 'active' : ''}><FaCog /> General Settings</button>
                <button onClick={() => setActiveTab('content')} className={activeTab === 'content' ? 'active' : ''}><FaDatabase /> Content & Data</button>
            </div>

            <div className="system-settings-tab-content">
                {activeTab === 'general' && (
                    <div className="general-settings-grid">
                        <div className="location-manager">
                            <EditableList
                                title="Municipalities"
                                items={Object.keys(settings.locations || {})}
                                onAdd={handleAddMunicipality}
                                onRemove={handleRemoveMunicipality}
                                onSelectItem={setSelectedMunicipality}
                                selectedItem={selectedMunicipality}
                            />
                            {selectedMunicipality ? (
                                <EditableList
                                    title={`Barangays in ${selectedMunicipality}`}
                                    items={(settings.locations || {})[selectedMunicipality] || []}
                                    onAdd={handleAddBarangay}
                                    onRemove={(brgy) => {
                                        const currentBarangays = (settings.locations || {})[selectedMunicipality] || [];
                                        const newBarangays = currentBarangays.filter(item => item !== brgy);
                                        const newLocations = { ...settings.locations, [selectedMunicipality]: newBarangays };
                                        handleSettingChange('locations', newLocations);
                                    }}
                                />
                            ) : (
                                <div className="placeholder-section">Select a municipality to manage its barangays.</div>
                            )}
                        </div>

                        <EditableList
                            title="Announcement Categories"
                            items={settings.announcementCategories || []}
                            onAdd={(item) => handleAddItem('announcementCategories', item)}
                            onRemove={(item) => handleRemoveItem('announcementCategories', item)}
                        />
                        <EditableList
                            title="Report Categories"
                            items={settings.reportCategories || []}
                            onAdd={(item) => handleAddItem('reportCategories', item)}
                            onRemove={(item) => handleRemoveItem('reportCategories', item)}
                        />
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="content-management-container">
                        <div className="data-purge-section">
                            <h4>Data Management</h4>
                            <div className="purge-action">
                                <p>Delete all announcements older than one year.</p>
                                <button className="purge-btn" onClick={handlePurgeAnnouncements}>Purge Old Announcements</button>
                            </div>
                            <div className="purge-action">
                                <p>Permanently delete all reports marked as 'archived'.</p>
                                <button className="purge-btn" onClick={handlePurgeArchivedReports}>Purge Archived Reports</button>
                            </div>
                        </div>

                        <div className="terms-editor-section">
                            <h4>Terms and Conditions</h4>
                            <textarea
                                value={termsContent}
                                onChange={(e) => setTermsContent(e.target.value)}
                                placeholder="Enter the content for your Terms and Conditions..."
                            />
                            <button className="save-terms-btn" onClick={handleSaveTerms}>Save Terms</button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default SystemSettingsModal;