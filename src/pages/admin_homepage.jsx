import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/admin-homepage.css";
import {
    FaCog, FaUsers, FaChartLine, FaServer, FaShieldAlt, FaDatabase,
    FaEnvelopeOpenText, FaHistory, FaBullhorn, FaFileAlt
} from "react-icons/fa";
import { MdOutlineAssignment } from "react-icons/md";

// =========================================================
// Admin Home Page (Focused on System Management & Analytics)
// =========================================================
function AdminHome() {
    const [date, setDate] = useState(new Date());

    // Fictional System Status Data
    const systemStatus = [
        "Server Health: Operational (99.9% Uptime)",
        "Database Backup: Successful (2 hours ago)",
        "Security Log: 5 suspicious login attempts blocked",
        "New User Signups: 12 pending verification",
    ];

    return (
        <div className="admin-page">
            {/* Top bar */}
            <header className="admin-top-bar">
                <div className="admin-logo">{"{System Admin}"}</div>
                <h2 className="admin-updates-title">System Management Dashboard</h2>
                <div className="admin-user-info">
                    <span className="admin-username">Root Admin</span>
                    <img src="https://via.placeholder.com/40/059669/ffffff" alt="admin" className="admin-avatar" />
                </div>
            </header>

            <div className="admin-content">
                {/* Left Sidebar - System Navigation */}
                <aside className="admin-left-panel">
                    <div className="admin-side-buttons">
                        {/* Core System Analytics */}
                        <button className="admin-sidebar-btn blue">
                            <FaChartLine size={28} />
                            <span>System Analytics</span>
                        </button>
                        {/* User/Role Management */}
                        <button className="admin-sidebar-btn teal">
                            <FaUsers size={28} />
                            <span>User & Role Config</span>
                        </button>
                        {/* Server/Database Health */}
                        <button className="admin-sidebar-btn orange">
                            <FaServer size={28} />
                            <span>Server Health</span>
                        </button>
                        {/* Security Configuration */}
                        <button className="admin-sidebar-btn red">
                            <FaShieldAlt size={28} />
                            <span>Security Settings</span>
                        </button>
                        {/* Data Management & Backup */}
                        <button className="admin-sidebar-btn purple">
                            <FaDatabase size={28} />
                            <span>Data Migration</span>
                        </button>
                        {/* Audit/Activity Log */}
                        <button className="admin-sidebar-btn green">
                            <FaHistory size={28} />
                            <span>Audit Trails</span>
                        </button>
                        {/* General System Settings */}
                        <button className="admin-sidebar-btn gray">
                            <FaCog size={28} />
                            <span>Global Settings</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content - Analytics and Status */}
                <main className="admin-main-content">
                    {/* Key Performance Indicators (KPIs) - System Focus */}
                    <div className="admin-overview">
                        <div className="admin-overview-card blue">
                            <h3>Total User Accounts</h3>
                            <p>1,245</p>
                            <span className="admin-card-detail">+1.2% this month</span>
                        </div>
                        <div className="admin-overview-card red">
                            <h3>Blocked Requests</h3>
                            <p>53</p>
                            <span className="admin-card-detail">Security Incidents</span>
                        </div>
                        <div className="admin-overview-card green">
                            <h3>Server Uptime</h3>
                            <p>99.9%</p>
                            <span className="admin-card-detail">Last 30 Days</span>
                        </div>
                        <div className="admin-overview-card orange">
                            <h3>Pending Backups</h3>
                            <p>0</p>
                            <span className="admin-card-detail">Next: 3:00 AM UTC</span>
                        </div>
                    </div>

                    {/* System Activity & Performance Graphs */}
                    <div className="admin-panel-large">
                        <h4>System Load & Performance Graph</h4>
                        <div className="admin-placeholder-graph">
                            {/* Placeholder for a line chart (e.g., CPU/RAM usage) */}
                            
                            <p>Simulated Data: Stable Load</p>
                        </div>
                    </div>

                    {/* Data Configuration & Management */}
                    <div className="admin-actions">
                        <h4>Critical System Actions</h4>
                        <button className="admin-action-btn"><FaServer /> Restart Application Server</button>
                        <button className="admin-action-btn"><FaDatabase /> Initiate Manual Data Backup</button>
                        <button className="admin-action-btn"><FaShieldAlt /> Review Security Exceptions</button>
                        <button className="admin-action-btn"><FaEnvelopeOpenText /> Configure Email Templates</button>
                    </div>

                    
                </main>

                {/* Right Sidebar - System Health Log */}
                <aside className="admin-right-panel">
                    <div className="admin-activity-box">
                        <h4>SYSTEM HEALTH LOG</h4>
                        {systemStatus.map((status, i) => (
                            <div className={`admin-status-item ${i === 0 ? 'good' : i === 2 ? 'warning' : ''}`} key={i}>
                                <span>{i === 0 ? '🟢' : i === 2 ? '⚠️' : '🔵'}</span> {status}
                            </div>
                        ))}
                    </div>

                    <div className="admin-calendar-box">
                        <h4>SCHEDULED MAINTENANCE</h4>
                        <Calendar value={date} onChange={setDate} />
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default AdminHome;