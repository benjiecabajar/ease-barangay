import React, { useState, useMemo } from 'react';
import { FaUsers, FaUserClock, FaChartLine, FaFileExport, FaShieldAlt, FaServer, FaUserPlus, FaHistory, FaFileAlt, FaBullhorn, FaCalendarAlt, FaMapMarkerAlt, FaCertificate, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../styles/analytics-dashboard.css';

const StatCard = ({ icon, label, value, detail, color }) => (
    <div className="stat-card">
        <div className="stat-icon" style={color ? { color: color, background: `${color}20` } : {}}>
            {icon}
        </div>
        <div className="stat-info">
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
            {detail && <span className="stat-detail">{detail}</span>}
        </div>
    </div>
);

const StatCardSkeleton = () => (
    <div className="stat-card skeleton-card">
        <div className="skeleton skeleton-icon"></div>
        <div className="stat-info">
            <div className="skeleton skeleton-line skeleton-value"></div>
            <div className="skeleton skeleton-line skeleton-label"></div>
        </div>
    </div>
);

const ChartSkeleton = () => (
    <div className="chart-section skeleton-card">
        <div className="skeleton skeleton-line skeleton-title" style={{ margin: '0 auto 1rem auto', width: '50%' }}></div>
        <div className="skeleton skeleton-chart-area"></div>
    </div>
);

const DashboardSkeleton = () => (
    <div className="analytics-dashboard-container">
        <div className="stats-grid">
            {[...Array(3)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="charts-grid">
            <ChartSkeleton />
            <ChartSkeleton />
        </div>
    </div>
);

const ROLE_COLORS = { Admins: '#0ea5e9', Moderators: '#8b5cf6', Residents: '#10b981' };

const AdminAnalyticsDashboard = ({ users, auditLogs, reports, settings, certificationRequests }) => {
    const [activeTab, setActiveTab] = useState('users');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedBarangay, setSelectedBarangay] = useState('All');

    // Assuming an isLoading prop is passed from admin-home.jsx
    const isLoading = !users || !auditLogs || !reports || !settings || !certificationRequests;
    if (isLoading) return <DashboardSkeleton />;

    const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleSetPresetRange = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (days - 1));
        setEndDate(formatDateForInput(end));
        setStartDate(formatDateForInput(start));
    };

    const barangayOptions = useMemo(() => {
        if (!settings || !settings.locations) {
            return [];
        }
        // Flatten all barangays from all municipalities into a single list
        return Object.values(settings.locations).flat();
    }, [settings]);

    const userAnalytics = useMemo(() => {
        const start = startDate ? new Date(startDate).getTime() : 0;
        const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Date.now();

        // Determine the base user list for calculations (all or filtered by barangay)
        const baseUsers = selectedBarangay === 'All'
            ? users
            : users.filter(u => u.barangay === selectedBarangay);

        // Filter users and logs by the selected date range
        const filteredUsers = baseUsers.filter(u => u.createdAt >= start && u.createdAt <= end);
        const filteredLogs = auditLogs.filter(log =>
            log.timestamp >= start && log.timestamp <= end &&
            (selectedBarangay === 'All' || baseUsers.some(u => u.id === log.userId))
        );
        
        const activeUserIds = new Set(
            filteredLogs.filter(log => log.role !== 'admin').map(log => log.userId)
        );

        // --- Chart Data Logic ---
        const registrationsByDay = new Map();
        filteredUsers.forEach(user => {
            if (user.createdAt) {
                const registrationDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                registrationsByDay.set(registrationDate, (registrationsByDay.get(registrationDate) || 0) + 1);
            }
        });

        const chartStart = startDate ? new Date(startDate) : new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
        const chartEnd = endDate ? new Date(endDate) : new Date();
        const diffTime = Math.abs(chartEnd - chartStart);
        const diffDays = Math.min(Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1, 90); // Cap at 90 days for performance

        const chartData = [];
        for (let i = 0; i < diffDays; i++) {
            const date = new Date(chartStart);
            date.setDate(chartStart.getDate() + i);
            const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            chartData.push({
                date: formattedDate,
                Registrations: registrationsByDay.get(formattedDate) || 0,
            });
        }

        const usersInSelectedBarangay = selectedBarangay === 'All'
            ? users.length // Show total if 'All' is selected
            : users.filter(u => u.barangay === selectedBarangay).length;

        const roleCounts = users.reduce((acc, user) => {
            const role = user.role || 'resident';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, { admin: 0, moderator: 0, resident: 0 });

        const roleDistribution = [
            { name: 'Admins', value: roleCounts.admin },
            { name: 'Moderators', value: roleCounts.moderator },
            { name: 'Residents', value: roleCounts.resident },
        ].filter(role => role.value > 0);

        return {
            totalUsers: users.length,
            newUsersInRange: filteredUsers.length,
            activeUsersInRange: activeUserIds.size,
            registrationTrend: chartData,
            roleDistribution,
            // The card for barangay count now shows total for that barangay, not affected by date.
            usersInSelectedBarangay: users.filter(u => selectedBarangay === 'All' || u.barangay === selectedBarangay).length,
        };
    }, [users, auditLogs, startDate, endDate, selectedBarangay]);

    const reportAnalytics = useMemo(() => {
        const start = startDate ? new Date(startDate).getTime() : 0;
        const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Date.now();

        // Filter reports by date range and selected barangay
        const filteredReports = reports.filter(report => {
            const reportDate = report.date;
            const user = users.find(u => u.id === report.userId);
            return reportDate >= start && reportDate <= end && (selectedBarangay === 'All' || (user && user.barangay === selectedBarangay));
        });

        const statusCounts = filteredReports.reduce((acc, report) => {
            acc[report.status] = (acc[report.status] || 0) + 1;
            return acc;
        }, {});

        const categoryCounts = filteredReports.reduce((acc, report) => {
            acc[report.type] = (acc[report.type] || 0) + 1;
            return acc;
        }, {});

        return {
            totalInRange: filteredReports.length,
            statusCounts,
            categoryChartData: Object.entries(categoryCounts).map(([name, count]) => ({ name, count })),
        };
    }, [reports, users, startDate, endDate, selectedBarangay]);

    const certificateAnalytics = useMemo(() => {
        const start = startDate ? new Date(startDate).getTime() : 0;
        const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Date.now();

        // Filter requests by date range and selected barangay
        const filteredRequests = certificationRequests.filter(req => {
            const reqDate = req.date;
            const user = users.find(u => u.id === req.userId);
            return reqDate >= start && reqDate <= end && (selectedBarangay === 'All' || (user && user.barangay === selectedBarangay));
        });


        const statusCounts = filteredRequests.reduce((acc, req) => {
            acc[req.status] = (acc[req.status] || 0) + 1;
            return acc;
        }, {});

        const typeCounts = filteredRequests.reduce((acc, req) => {
            acc[req.type] = (acc[req.type] || 0) + 1;
            return acc;
        }, {});

        return {
            totalInRange: filteredRequests.length,
            approved: statusCounts['Approved'] || 0,
            declined: statusCounts['Declined'] || 0,
            typeChartData: Object.entries(typeCounts).map(([name, count]) => ({ name, count })),
        };
    }, [certificationRequests, users, startDate, endDate, selectedBarangay]);

    const moderatorPerformance = useMemo(() => {
        const start = startDate ? new Date(startDate).getTime() : 0;
        const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Date.now();

        const filteredLogs = auditLogs.filter(log => log.timestamp >= start && log.timestamp <= end);
        
        const moderators = users.filter(user => user.role === 'moderator');

        return moderators.map(moderator => {
            const moderatorActions = filteredLogs.filter(log => log.userId === moderator.id);

            const reportsProcessed = moderatorActions.filter(log => log.action === 'Updated Report Status').length;
            const announcementsCreated = moderatorActions.filter(log => log.action === 'Created Announcement').length;

            const processedReportLogs = moderatorActions.filter(log => log.action === 'Updated Report Status');
            const responseTimes = processedReportLogs.map(log => {
                const report = reports.find(r => r.id === log.details.reportId);
                if (report && report.date) {
                    return log.timestamp - report.date;
                }
                return null;
            }).filter(Boolean);

            const avgResponseTime = responseTimes.length > 0
                ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) / (1000 * 60 * 60) // in hours
                : 0;

            return {
                ...moderator,
                reportsProcessed,
                announcementsCreated,
                avgResponseTime: avgResponseTime.toFixed(1),
            };
        });
    }, [users, auditLogs, reports, startDate, endDate]);

    const exportToCSV = (data, filename) => {
        if (data.length === 0) {
            alert("No data to export.");
            return;
        }
        
        const replacer = (key, value) => value === null ? '' : value;
        const header = Object.keys(data[0]);
        let csv = data.map(row => header.map(fieldName => 
            JSON.stringify(row[fieldName], replacer)).join(','));
        csv.unshift(header.join(','));
        csv = csv.join('\r\n');
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportUsers = () => {
        const userData = users.map(({ password, ...rest }) => rest); // Exclude passwords
        exportToCSV(userData, 'user_list');
    };

    const handleExportAuditLogs = () => {
        const logData = auditLogs.map(log => ({
            ...log,
            timestamp: new Date(log.timestamp).toISOString(),
            details: JSON.stringify(log.details),
        }));
        exportToCSV(logData, 'audit_logs');
    };

    const handleExportReports = () => {
        const reportData = reports.map(r => ({
            id: r.id,
            date: new Date(r.date).toISOString(),
            status: r.status,
            type: r.type,
            description: r.description,
        }));
        exportToCSV(reportData, 'report_summary');
    };

    return (
        <div className="analytics-dashboard-container">
            <div className="dashboard-header">
                <h1>Advanced Analytics & Reporting</h1>
                <div className="date-range-filter">
                    <div className="preset-buttons">
                        <button onClick={() => handleSetPresetRange(7)}>Last 7 Days</button>
                        <button onClick={() => handleSetPresetRange(30)}>Last 30 Days</button>
                    </div>
                    <FaCalendarAlt />
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <span>to</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />
                    <button onClick={() => { setStartDate(''); setEndDate(''); }}>Clear</button>
                </div>
            </div>
            <div className="analytics-tabs">
                <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}><FaUsers /> User Analytics</button>
                <button onClick={() => setActiveTab('moderators')} className={activeTab === 'moderators' ? 'active' : ''}><FaShieldAlt /> Moderator Performance</button>
                <button onClick={() => setActiveTab('reports')} className={activeTab === 'reports' ? 'active' : ''}><FaFileAlt /> Reports Analytics</button>
                <button onClick={() => setActiveTab('certs')} className={activeTab === 'certs' ? 'active' : ''}><FaCertificate /> Certificate Analytics</button>
                <button onClick={() => setActiveTab('export')} className={activeTab === 'export' ? 'active' : ''}><FaFileExport /> Data Export</button>
            </div>

            <div className="analytics-tab-content">
                {activeTab === 'users' && (
                    <>
                        <div className="analytics-filters">
                            <select value={selectedBarangay} onChange={e => setSelectedBarangay(e.target.value)}>
                                <option value="All">Overall</option>
                                {barangayOptions.map(brgy => <option key={brgy} value={brgy}>{brgy}</option>)}
                            </select>
                        </div>
                        <div className="stats-grid">
                            <StatCard icon={<FaUsers />} label="Total Users" value={userAnalytics.totalUsers} detail="All time" color="#3b82f6" /> 
                            <StatCard icon={<FaUserPlus />} label="New Users" value={userAnalytics.newUsersInRange} detail="in selected range" color="#10b981" />
                            <StatCard icon={<FaUserClock />} label="Active Users" value={userAnalytics.activeUsersInRange} detail="in selected range" color="#f97316" />
                            {selectedBarangay !== 'All' && (
                                <StatCard icon={<FaMapMarkerAlt />} label={`Total in ${selectedBarangay}`} value={userAnalytics.usersInSelectedBarangay} color="#8b5cf6" />
                            )}
                        </div>
                        <div className="charts-grid">
                            <div className="chart-section">
                                <h4>User Registration Trends</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={userAnalytics.registrationTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '8px' }}
                                            labelStyle={{ fontWeight: 'bold' }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="Registrations" stroke="#1877f2" strokeWidth={2} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="chart-section">
                                <h4>User Role Distribution</h4>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={userAnalytics.roleDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                            {userAnalytics.roleDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.name]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '8px' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'moderators' && (
                    <table className="performance-table">
                        <thead>
                            <tr>
                                <th>Moderator</th>
                                <th>Assigned Barangay</th>
                                <th>Reports Processed</th>
                                <th>Announcements Created</th>
                                <th>Avg. Response Time (hrs)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {moderatorPerformance.map(mod => (
                                <tr key={mod.id}>
                                    <td>{mod.username}</td>
                                    <td>{mod.barangay}</td>
                                    <td>{mod.reportsProcessed}</td>
                                    <td>{mod.announcementsCreated}</td>
                                    <td>{mod.avgResponseTime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'reports' && (
                    <>
                        <div className="analytics-filters">
                            <select value={selectedBarangay} onChange={e => setSelectedBarangay(e.target.value)}>
                                <option value="All">Overall</option>
                                {barangayOptions.map(brgy => <option key={brgy} value={brgy}>{brgy}</option>)}
                            </select>
                        </div>
                        <div className="stats-grid">
                            <StatCard icon={<FaFileAlt />} label="Total Reports" value={reportAnalytics.totalInRange} detail="in selected range" color="#3b82f6" />
                            <StatCard icon={<FaCheckCircle />} label="Resolved" value={reportAnalytics.statusCounts['resolved'] || 0} color="#22c55e" />
                            <StatCard icon={<FaTimesCircle />} label="Declined" value={reportAnalytics.statusCounts['declined'] || 0} color="#ef4444" />
                        </div>
                        <div className="chart-section">
                            <h4>Reports by Category</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={reportAnalytics.categoryChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="count" name="Count" stroke="#8884d8" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}

                {activeTab === 'certs' && (
                     <>
                        <div className="analytics-filters">
                            <select value={selectedBarangay} onChange={e => setSelectedBarangay(e.target.value)}>
                                <option value="All">Overall</option>
                                {barangayOptions.map(brgy => <option key={brgy} value={brgy}>{brgy}</option>)}
                            </select>
                        </div>
                        <div className="stats-grid">
                            <StatCard icon={<FaCertificate />} label="Total Requests" value={certificateAnalytics.totalInRange} detail="in selected range" color="#3b82f6" />
                            <StatCard icon={<FaCheckCircle />} label="Approved" value={certificateAnalytics.approved} color="#22c55e" />
                            <StatCard icon={<FaTimesCircle />} label="Declined" value={certificateAnalytics.declined} color="#ef4444" />
                        </div>
                        <div className="chart-section">
                            <h4>Requests by Certificate Type</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={certificateAnalytics.typeChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={50} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '8px' }}
                                    />
                                    <Line type="monotone" dataKey="count" name="Requests" stroke="#10b981" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}

                {activeTab === 'export' && (
                    <div className="export-container">
                        <h3>Export Data</h3>
                        <p>Download system data as CSV files for official records or offline analysis.</p>
                        <div className="export-buttons">
                            <button onClick={handleExportUsers}>
                                <FaUsers /> Export User List
                            </button>
                            <button onClick={handleExportAuditLogs}>
                                <FaHistory /> Export Audit Logs
                            </button>
                            <button onClick={handleExportReports}>
                                <FaFileAlt /> Export Report Summary
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAnalyticsDashboard;