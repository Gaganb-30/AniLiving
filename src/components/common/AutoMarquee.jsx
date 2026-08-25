import React from 'react';

/**
 * AutoMarquee component — provides a smooth, continuous auto-moving marquee on mobile
 * while cleanly degrading to a standard responsive grid on tablet and desktop screens.
 */
const AutoMarquee = ({
  children,
  speed = 28,
  reverse = false,
  pauseOnHover = true,
  className = '',
}) => {
  return (
    <div className={`auto-marquee-wrapper ${pauseOnHover ? 'pause-on-hover' : ''} ${className}`}>
      <div
        className={`auto-marquee-track ${reverse ? 'reverse' : ''}`}
        style={{ '--marquee-duration': `${speed}s` }}
      >
        <div className="auto-marquee-content">
          {children}
        </div>
        <div className="auto-marquee-content" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AutoMarquee;
