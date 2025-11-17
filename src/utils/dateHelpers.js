/**
 * Calculate the number of days remaining until a deadline
 * @param {string} deadline - Date string in YYYY-MM-DD format
 * @returns {number} - Number of days remaining (negative if overdue)
 */
export const getDaysRemaining = (deadline) => {
  if (!deadline) return null;
  
  const deadlineDate = new Date(deadline);
  const today = new Date();
  
  // Reset time to midnight for accurate day calculation
  deadlineDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const timeDiff = deadlineDate - today;
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  return daysDiff;
};

/**
 * Check if a deadline has passed
 * @param {string} deadline - Date string in YYYY-MM-DD format
 * @returns {boolean} - True if the deadline has passed
 */
export const isOverdue = (deadline) => {
  if (!deadline) return false;
  
  const daysRemaining = getDaysRemaining(deadline);
  return daysRemaining !== null && daysRemaining < 0;
};

/**
 * Format a date string for display
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} - Formatted date string (e.g., "Feb 10, 2025")
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString('en-US', options);
};
