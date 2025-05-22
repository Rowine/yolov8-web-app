/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Find users within specified radius
 * @param {Object} currentLocation - Current user's location {lat, lng}
 * @param {Array} allUsers - Array of all users with their locations
 * @param {number} radiusKm - Radius to search within (in kilometers)
 * @returns {Array} Array of users within the specified radius
 */
export const findNearbyUsers = (currentLocation, allUsers, radiusKm = 10) => {
  return allUsers.filter(user => {
    if (!user.farmLocation || !user.farmLocation.lat || !user.farmLocation.lng) {
      return false;
    }

    const distance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      user.farmLocation.lat,
      user.farmLocation.lng
    );

    return distance <= radiusKm;
  });
}; 