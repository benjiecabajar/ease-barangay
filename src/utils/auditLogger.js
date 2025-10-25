/**
 * Logs an action to the audit trail in localStorage.
 * @param {string} action - A description of the action (e.g., 'User Login', 'Deleted Post').
 * @param {object} [details={}] - An object containing relevant details (e.g., { username: 'benjo', postId: 123 }).
 * @param {string} role - The role of the user performing the action (e.g., 'moderator', 'resident').
 */
export const logAuditAction = (action, details = {}, role = 'system') => {
  try {
    const logKey = `${role}_auditLogs`;
    const auditLogs = JSON.parse(localStorage.getItem(logKey)) || [];
    
    const userProfile = JSON.parse(localStorage.getItem('userProfile'));
    // Use the role from the profile if available, otherwise fallback to the passed role or 'System'
    const username = userProfile?.name || (role === 'system' ? 'System/Unknown' : 'User');

    const newLogEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: username,
      action,
      details,
    };

    // Add to the beginning of the array and limit the log size
    const updatedLogs = [newLogEntry, ...auditLogs].slice(0, 500);

    localStorage.setItem(logKey, JSON.stringify(updatedLogs));
  } catch (error) {
    console.error("Failed to write to audit log:", error);
  }
};