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
    const actor = role === 'admin' ? 'Admin' : (userProfile?.name || 'System/Unknown');
    const userId = role === 'admin' ? 'admin_user' : (userProfile?.id || 'system');

    const newLogEntry = {
      id: Date.now(),
      timestamp: Date.now(),
      actor: actor,
      userId: userId,
      role: role,
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