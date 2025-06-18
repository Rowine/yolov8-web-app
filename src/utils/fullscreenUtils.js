/**
 * Fullscreen utilities for PWA
 */

/**
 * Request fullscreen mode
 * @returns {Promise<boolean>} Success status
 */
export const requestFullscreen = async () => {
  try {
    const element = document.documentElement;

    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      await element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      await element.msRequestFullscreen();
    }

    return true;
  } catch (error) {
    console.warn('Fullscreen request failed:', error);
    return false;
  }
};

/**
 * Exit fullscreen mode
 * @returns {Promise<boolean>} Success status
 */
export const exitFullscreen = async () => {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      await document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      await document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      await document.msExitFullscreen();
    }

    return true;
  } catch (error) {
    console.warn('Exit fullscreen failed:', error);
    return false;
  }
};

/**
 * Check if currently in fullscreen mode
 * @returns {boolean} Whether in fullscreen
 */
export const isFullscreen = () => {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
};

/**
 * Check if fullscreen is available
 * @returns {boolean} Whether fullscreen is supported
 */
export const isFullscreenAvailable = () => {
  const element = document.documentElement;
  return !!(
    element.requestFullscreen ||
    element.webkitRequestFullscreen ||
    element.mozRequestFullScreen ||
    element.msRequestFullscreen
  );
};

/**
 * Toggle fullscreen mode
 * @returns {Promise<boolean>} Success status
 */
export const toggleFullscreen = async () => {
  if (isFullscreen()) {
    return await exitFullscreen();
  } else {
    return await requestFullscreen();
  }
};

/**
 * Check if app is running as PWA
 * @returns {boolean} Whether running as PWA
 */
export const isPWA = () => {
  return (
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.navigator.standalone === true
  );
};

/**
 * Add fullscreen event listeners
 * @param {Function} onFullscreenChange - Callback for fullscreen changes
 * @returns {Function} Cleanup function
 */
export const addFullscreenListeners = (onFullscreenChange) => {
  const events = [
    'fullscreenchange',
    'webkitfullscreenchange',
    'mozfullscreenchange',
    'msfullscreenchange'
  ];

  const handleChange = () => {
    onFullscreenChange(isFullscreen());
  };

  events.forEach(event => {
    document.addEventListener(event, handleChange);
  });

  // Return cleanup function
  return () => {
    events.forEach(event => {
      document.removeEventListener(event, handleChange);
    });
  };
}; 