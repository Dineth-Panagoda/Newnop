// ========================================
// LOADER COMPONENT
// ========================================
// Loading spinner to indicate async operations

import './Loader.css';
import classNames from '../../utils/classNames';

/**
 * Loader component props:
 * @param {string} size - Spinner size: 'small', 'medium', 'large'
 * @param {boolean} fullScreen - Cover entire screen
 * @param {string} text - Optional loading text to display
 */
const Loader = ({
  size = 'medium',
  fullScreen = false,
  text,
  className,
  ...rest
}) => {
  const containerClasses = classNames(
    "loaderContainer",
    fullScreen && 'loaderContainer-fullScreen',
    className
  );

  const spinnerClasses = classNames(
    "spinner",
    `spinner-${size}`
  );

  return (
    <div className={containerClasses} {...rest}>
      <div className={spinnerClasses} />
      {text && <p className="loadingText">{text}</p>}
    </div>
  );
};

export default Loader;
