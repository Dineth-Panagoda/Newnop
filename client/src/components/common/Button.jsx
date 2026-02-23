// ========================================
// BUTTON COMPONENT
// ========================================
// Reusable button component with different variants and sizes

import styles from './Button.module.css';
import classNames from '../../utils/classNames';

/**
 * Button component props:
 * @param {string} variant - Button style: 'primary', 'secondary', 'success', 'danger', 'outline', 'ghost'
 * @param {string} size - Button size: 'small', 'medium', 'large'
 * @param {boolean} fullWidth - Make button full width
 * @param {boolean} disabled - Disable button
 * @param {function} onClick - Click handler
 * @param {ReactNode} children - Button content
 * @param {string} type - Button type: 'button', 'submit', 'reset'
 */
const Button = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  onClick,
  children,
  type = 'button',
  className,
  ...rest
}) => {
  // Combine class names based on props
  const buttonClasses = classNames(
    styles.button,
    styles[`button-${size}`],
    styles[`button-${variant}`],
    fullWidth && styles['button-fullWidth'],
    className
  );

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
