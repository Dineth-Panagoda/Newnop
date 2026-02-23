// ========================================
// LOADER COMPONENT
// ========================================
// Loading spinner to indicate async operations

import styles from './Loader.module.css';
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
    styles.loaderContainer,
    fullScreen && styles['loaderContainer-fullScreen'],
    className
  );

  const spinnerClasses = classNames(
    styles.spinner,
    styles[`spinner-${size}`]
  );

  return (
    <div className={containerClasses} {...rest}>
      <div className={spinnerClasses} />
      {text && <p className={styles.loadingText}>{text}</p>}
    </div>
  );
};

export default Loader;
