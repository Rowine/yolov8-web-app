import { useState, useEffect } from 'react';

/**
 * Hook to detect if the device supports touch input
 * This is particularly useful for Raspberry Pi with touch screens
 * where we want to force mobile-like behavior
 */
export const useTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isRaspberryPi, setIsRaspberryPi] = useState(false);

  useEffect(() => {
    // Detect if touch is supported
    const touchSupported = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );

    // Detect Raspberry Pi specifically
    const userAgent = navigator.userAgent.toLowerCase();
    const isRpi = userAgent.includes('arm') || userAgent.includes('linux arm');

    setIsTouchDevice(touchSupported);
    setIsRaspberryPi(isRpi);

    // Force touch behavior on Raspberry Pi or detected touch devices
    if (touchSupported || isRpi) {
      // Add a CSS class to body for global touch behavior
      document.body.classList.add('touch-enabled');

      // Set viewport meta tag for better touch handling
      let viewport = document.querySelector("meta[name=viewport]");
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
      }
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    }

    return () => {
      document.body.classList.remove('touch-enabled');
    };
  }, []);

  return { isTouchDevice, isRaspberryPi };
};

export default useTouchDevice; 