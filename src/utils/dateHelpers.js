/**
 * Format a date to a readable string
 * @param {Date|string} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Date(date).toLocaleDateString("en-US", {
    ...defaultOptions,
    ...options,
  });
};

/**
 * Check if two dates are the same day
 * @param {Date|string} date1
 * @param {Date|string} date2
 * @returns {boolean}
 */
export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.toDateString() === d2.toDateString();
};

/**
 * Get dates for the last N days
 * @param {number} days - Number of days to go back
 * @returns {Array<Date>}
 */
export const getLastNDays = (days) => {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    dates.push(date);
  }
  return dates;
};

/**
 * Check if a date is today
 * @param {Date|string} date
 * @returns {boolean}
 */
export const isToday = (date) => {
  return isSameDay(date, new Date());
};

/**
 * Format date for API queries (YYYY-MM-DD)
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDateForAPI = (date) => {
  return new Date(date).toISOString().split("T")[0];
};
