// ========================================
// BUTTON COMPONENT
// ========================================
// Reusable button component with different variants and sizes

import styled from 'styled-components';

// ========================================
// STYLED COMPONENTS
// ========================================

/**
 * Styled button with dynamic styles based on props
 * Styled-components allows us to write CSS in JavaScript
 * Props are passed to the component and used to determine styles
 */
const StyledButton = styled.button`
  /* Base styles */
  padding: ${props => {
    // Different padding based on size prop
    if (props.$size === 'small') return '0.5rem 1rem';
    if (props.$size === 'large') return '0.875rem 1.75rem';
    return '0.625rem 1.25rem'; // default (medium)
  }};

  font-size: ${props => {
    if (props.$size === 'small') return '0.875rem';
    if (props.$size === 'large') return '1.125rem';
    return '1rem';
  }};

  font-weight: 500;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Background and text colors based on variant */
  ${props => {
    // Primary variant (default)
    if (props.$variant === 'primary') {
      return `
        background-color: var(--primary-color);
        color: white;

        &:hover:not(:disabled) {
          background-color: var(--primary-dark);
        }
      `;
    }

    // Secondary variant
    if (props.$variant === 'secondary') {
      return `
        background-color: var(--gray-200);
        color: var(--gray-800);

        &:hover:not(:disabled) {
          background-color: var(--gray-300);
        }
      `;
    }

    // Success variant
    if (props.$variant === 'success') {
      return `
        background-color: var(--success-color);
        color: white;

        &:hover:not(:disabled) {
          background-color: #059669;
        }
      `;
    }

    // Danger variant
    if (props.$variant === 'danger') {
      return `
        background-color: var(--danger-color);
        color: white;

        &:hover:not(:disabled) {
          background-color: #dc2626;
        }
      `;
    }

    // Outline variant
    if (props.$variant === 'outline') {
      return `
        background-color: transparent;
        color: var(--primary-color);
        border: 2px solid var(--primary-color);

        &:hover:not(:disabled) {
          background-color: var(--primary-color);
          color: white;
        }
      `;
    }

    // Ghost variant (no background)
    if (props.$variant === 'ghost') {
      return `
        background-color: transparent;
        color: var(--gray-700);

        &:hover:not(:disabled) {
          background-color: var(--gray-100);
        }
      `;
    }

    // Default to primary if no variant specified
    return `
      background-color: var(--primary-color);
      color: white;
    `;
  }}

  /* Full width option */
  ${props => props.$fullWidth && 'width: 100%;'}
`;

// ========================================
// BUTTON COMPONENT
// ========================================

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
  ...rest
}) => {
  return (
    <StyledButton
      $variant={variant}      // $ prefix prevents prop from being passed to DOM
      $size={size}
      $fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...rest}               // Spread any additional props (className, id, etc.)
    >
      {children}
    </StyledButton>
  );
};

export default Button;
