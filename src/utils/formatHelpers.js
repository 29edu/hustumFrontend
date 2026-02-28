/**
 * Calculate percentage
 * @param {number} value
 * @param {number} total
 * @returns {number}
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Get status badge configuration
 * @param {string} status
 * @returns {Object}
 */
export const getStatusBadge = (status) => {
  const badges = {
    pending: {
      text: "Not started",
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
    },
    started: {
      text: "In Progress",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-700",
    },
    completed: {
      text: "Done",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
    },
  };

  return badges[status] || badges.pending;
};

/**
 * Format number with commas
 * @param {number} num
 * @returns {string}
 */
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};
