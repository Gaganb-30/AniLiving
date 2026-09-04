import React, { useState } from 'react';
import { HiPlay, HiPause } from 'react-icons/hi';

/**
 * AutoMarquee component — provides a smooth, continuous auto-moving marquee on mobile
 * while cleanly degrading to a standard responsive grid on tablet and desktop screens.
 */
const AutoMarquee = ({
  children,
  speed = 28,
  reverse = false,
  pauseOnHover = true,
  showControls = false,
  className = '',
}) => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className={`auto-marquee-wrapper ${pauseOnHover ? 'pause-on-hover' : ''} ${isPaused ? 'is-paused' : ''} ${className}`}>
      <div
        className={`auto-marquee-track ${reverse ? 'reverse' : ''}`}
        style={{
          '--marquee-duration': `${speed}s`,
          animationPlayState: isPaused ? 'paused' : undefined,
        }}
      >
        <div className="auto-marquee-content">
          {children}
        </div>
        <div className="auto-marquee-content" aria-hidden="true">
          {children}
        </div>
      </div>

      {showControls && (
        <div className="marquee-control-bar">
          <button
            type="button"
            className={`marquee-toggle-btn ${isPaused ? 'is-paused' : ''}`}
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
          >
            {isPaused ? <HiPlay className="marquee-toggle-icon" /> : <HiPause className="marquee-toggle-icon" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AutoMarquee;
