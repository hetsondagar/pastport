/**
 * Timezone Utility for Indian Standard Time (IST)
 * IST is UTC+5:30
 */

/**
 * Convert date to IST
 * @param {Date} date - Date to convert
 * @returns {Date} Date in IST
 */
export const toIST = (date = new Date()) => {
  // IST is UTC+5:30 (330 minutes ahead of UTC)
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const istTime = new Date(utc + (330 * 60000));
  return istTime;
};

/**
 * Get current time in IST
 * @returns {Date} Current date/time in IST
 */
export const getCurrentIST = () => {
  return toIST(new Date());
};

/**
 * Format date to IST string
 * @param {Date} date - Date to format
 * @returns {string} Formatted IST date string
 */
export const formatIST = (date) => {
  const istDate = toIST(date);
  return istDate.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Check if unlock date has passed in IST
 * @param {Date} unlockDate - Date to check
 * @returns {boolean} True if unlock date has passed
 */
export const canUnlockInIST = (unlockDate) => {
  const currentIST = getCurrentIST();
  const unlockIST = toIST(new Date(unlockDate));
  return currentIST >= unlockIST;
};

/**
 * Get time remaining until unlock in IST
 * @param {Date} unlockDate - Unlock date
 * @returns {number} Milliseconds until unlock
 */
export const getTimeUntilUnlockIST = (unlockDate) => {
  const currentIST = getCurrentIST();
  const unlockIST = toIST(new Date(unlockDate));
  const diff = unlockIST.getTime() - currentIST.getTime();
  return Math.max(0, diff);
};

/**
 * Get start of day in IST
 * @param {Date} date - Date to process
 * @returns {Date} Start of day in IST
 */
export const getStartOfDayIST = (date = new Date()) => {
  const istDate = toIST(date);
  istDate.setHours(0, 0, 0, 0);
  return istDate;
};

/**
 * Get end of day in IST
 * @param {Date} date - Date to process
 * @returns {Date} End of day in IST
 */
export const getEndOfDayIST = (date = new Date()) => {
  const istDate = toIST(date);
  istDate.setHours(23, 59, 59, 999);
  return istDate;
};

export default {
  toIST,
  getCurrentIST,
  formatIST,
  canUnlockInIST,
  getTimeUntilUnlockIST,
  getStartOfDayIST,
  getEndOfDayIST
};

