// ========================================
// AURORA BACKGROUND COMPONENT
// ========================================
// Animated aurora/gradient background effect

import './Aurora.css';

/**
 * Aurora component props:
 * @param {array} colorStops - Array of color stops for the gradient (default: lime green theme)
 * @param {number} amplitude - Animation intensity 0-1 (default: 0.5)
 * @param {number} blend - Blend amount 0-1 (default: 1)
 */
const Aurora = ({
  colorStops = ["#00c7fc", "#7cff67", "#ffffff"],
  amplitude = 0.5,
  blend = 1,
  className = ''
}) => {
  const style = {
    '--aurora-color-1': colorStops[0],
    '--aurora-color-2': colorStops[1],
    '--aurora-color-3': colorStops[2] || colorStops[0],
    '--aurora-amplitude': amplitude,
    '--aurora-blend': blend
  };

  return (
    <div className={`aurora-container ${className}`} style={style}>
      <div className="aurora-gradient aurora-gradient-1"></div>
      <div className="aurora-gradient aurora-gradient-2"></div>
      <div className="aurora-gradient aurora-gradient-3"></div>
    </div>
  );
};

export default Aurora;
