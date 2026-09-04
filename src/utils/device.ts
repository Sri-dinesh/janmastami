/**
 * Device detection and adaptive performance helpers
 */

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768 ||
    (navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints > 1 && window.innerWidth < 1024)
  );
};

export const isMobile = isMobileDevice();
