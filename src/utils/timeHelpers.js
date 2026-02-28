/**
 * Calculate time remaining from now to deadline
 * @param {string|Date} deadline - The deadline date
 * @returns {object} - Object containing hours, minutes, and isOverdue flag
 */
export const calculateTimeRemaining = (deadline) => {
  if (!deadline) {
    return { hours: 0, minutes: 0, isOverdue: false, totalMinutes: 0 };
  }

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate - now;

  if (diffMs < 0) {
    // Deadline has passed
    const absDiffMs = Math.abs(diffMs);
    const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
    const minutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
      hours,
      minutes,
      isOverdue: true,
      totalMinutes: Math.floor(absDiffMs / (1000 * 60)),
    };
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const totalMinutes = Math.floor(diffMs / (1000 * 60));

  return { hours, minutes, isOverdue: false, totalMinutes };
};

/**
 * Format time remaining for display
 * @param {object} timeRemaining - Object from calculateTimeRemaining
 * @returns {string} - Formatted string like "5h 30m left" or "Overdue by 2h 15m"
 */
export const formatTimeRemaining = (timeRemaining) => {
  if (!timeRemaining || timeRemaining.totalMinutes === 0) {
    return null;
  }

  const { hours, minutes, isOverdue } = timeRemaining;

  let timeStr = "";
  if (hours > 0) {
    timeStr += `${hours}h `;
  }
  if (minutes > 0 || hours === 0) {
    timeStr += `${minutes}m`;
  }

  if (isOverdue) {
    return `Overdue by ${timeStr.trim()}`;
  }

  return `${timeStr.trim()} left`;
};
