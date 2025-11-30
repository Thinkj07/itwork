/**
 * Format website URL to ensure it has a protocol
 * @param {string} url - The website URL (may or may not have protocol)
 * @returns {string} - URL with protocol (https:// if not specified)
 */
export const formatWebsiteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };
  
  /**
   * Format website URL for display (remove protocol)
   * @param {string} url - The website URL
   * @returns {string} - URL without protocol for display
   */
  export const formatWebsiteDisplay = (url) => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '');
  };