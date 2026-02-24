// ========================================
// SHINY TEXT COMPONENT
// ========================================
// Animated text with shimmer/shine effect

import { useState } from 'react';
import './ShinyText.css';

/**
 * ShinyText component props:
 * @param {string} text - The text to display
 * @param {number} speed - Animation speed in seconds (default: 2)
 * @param {number} delay - Animation delay in seconds (default: 0)
 * @param {string} color - Base text color (default: "#212121")
 * @param {string} shineColor - Shimmer highlight color (default: "#76FF03")
 * @param {number} spread - Width of the shine effect in degrees (default: 120)
 * @param {string} direction - Animation direction: "left" or "right" (default: "left")
 * @param {boolean} yoyo - Whether to reverse animation on repeat (default: false)
 * @param {boolean} pauseOnHover - Pause animation on hover (default: false)
 * @param {boolean} disabled - Disable the shine effect (default: false)
 */
const ShinyText = ({
  text,
  speed = 2,
  delay = 0,
  color = '#212121',
  shineColor = '#76FF03',
  spread = 120,
  direction = 'left',
  yoyo = false,
  pauseOnHover = false,
  disabled = false,
  className = '',
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const shouldPause = pauseOnHover && isHovered;

  const style = {
    '--shine-color': color,
    '--shine-highlight': shineColor,
    '--shine-speed': `${speed}s`,
    '--shine-delay': `${delay}s`,
    '--shine-spread': `${spread}deg`,
    '--shine-direction': yoyo ? 'alternate' : (direction === 'right' ? 'reverse' : 'normal'),
    '--shine-iteration': 'infinite',
    animationPlayState: shouldPause ? 'paused' : 'running'
  };

  return (
    <span
      className={`shiny-text ${disabled ? 'shiny-text-disabled' : ''} ${className}`}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      {text}
    </span>
  );
};

export default ShinyText;
