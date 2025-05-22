import { calculateDistance } from './locationUtils';

/**
 * Send SMS using Semaphore API
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} message - Message content
 * @returns {Promise} API response
 */
export const sendSMS = async (phoneNumber, message) => {
  const SEMAPHORE_API_KEY = import.meta.env.VITE_SEMAPHORE_API_KEY;
  const SENDER_NAME = import.meta.env.VITE_SEMAPHORE_SENDER_NAME || 'FARMAPP';

  try {
    const response = await fetch('/api/semaphore/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: SEMAPHORE_API_KEY,
        number: phoneNumber,
        message: message,
        sendername: SENDER_NAME,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send SMS');
    }

    return await response.json();
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};

/**
 * Notify nearby users about detected issues
 * @param {Object} currentLocation - Current user's location {lat, lng}
 * @param {Array} detectedIssues - Array of detected diseases/pests
 * @param {Array} nearbyUsers - Array of nearby users to notify
 * @param {string} currentUserId - The ID of the currently logged-in user
 */
export const notifyNearbyUsers = async (currentLocation, detectedIssues, nearbyUsers, currentUserId) => {
  const issuesList = detectedIssues.map(issue => issue.name).join(', ');

  // Filter out the current user from notifications
  const otherUsers = nearbyUsers.filter(user => user.uid !== currentUserId);

  for (const user of otherUsers) {
    if (!user.phone) continue;

    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      user.farmLocation.lat,
      user.farmLocation.lng
    ).toFixed(2);

    const message = `Alert: ${issuesList} detected ${distance}km from your farm location. Please check your crops and take necessary precautions.`;

    try {
      await sendSMS(user.phone, message);
    } catch (error) {
      console.error(`Failed to notify user ${user.uid}:`, error);
    }
  }
}; 