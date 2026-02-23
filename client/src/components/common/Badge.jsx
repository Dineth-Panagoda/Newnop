// ========================================
// BADGE COMPONENT
// ========================================
// Visual indicator for status, priority, and severity
// Shows different colors based on the variant

import './Badge.css';
import classNames from '../../utils/classNames';

/**
 * Badge component props:
 * @param {string} variant - Badge type (status, priority, or severity value)
 * @param {string} size - Badge size: 'small' (default), 'large'
 * @param {ReactNode} children - Badge content
 */
const Badge = ({
  variant,
  size = 'small',
  children,
  className,
  ...rest
}) => {
  const badgeClasses = classNames(
    "badge",
    variant && `badge-${variant}`,
    size === 'large' && 'badge-large',
    className
  );

  return (
    <span className={badgeClasses} {...rest}>
      {children || variant}
    </span>
  );
};

export default Badge;
