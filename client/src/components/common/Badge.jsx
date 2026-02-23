// ========================================
// BADGE COMPONENT
// ========================================
// Visual indicator for status, priority, and severity
// Shows different colors based on the variant

import styled from 'styled-components';

// ========================================
// STYLED COMPONENT
// ========================================

/**
 * Badge with dynamic colors based on variant
 * Used to visually represent status, priority, or severity
 */
const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-lg);
  text-transform: uppercase;
  letter-spacing: 0.025em;

  /* Size variant */
  ${props => props.$size === 'large' && `
    padding: 0.375rem 0.875rem;
    font-size: var(--text-sm);
  `}

  /* Color based on variant */
  ${props => {
    // Status variants
    if (props.$variant === 'Open') {
      return `
        background-color: var(--info-light);
        color: var(--info-color);
      `;
    }

    if (props.$variant === 'InProgress') {
      return `
        background-color: var(--warning-light);
        color: var(--warning-color);
      `;
    }

    if (props.$variant === 'Resolved') {
      return `
        background-color: var(--success-light);
        color: var(--success-color);
      `;
    }

    if (props.$variant === 'Closed') {
      return `
        background-color: var(--gray-200);
        color: var(--gray-600);
      `;
    }

    // Priority variants
    if (props.$variant === 'Low') {
      return `
        background-color: var(--gray-200);
        color: var(--gray-700);
      `;
    }

    if (props.$variant === 'Medium') {
      return `
        background-color: #dbeafe;
        color: #1e40af;
      `;
    }

    if (props.$variant === 'High') {
      return `
        background-color: var(--warning-light);
        color: #c2410c;
      `;
    }

    if (props.$variant === 'Critical') {
      return `
        background-color: var(--danger-light);
        color: #991b1b;
      `;
    }

    // Default (gray)
    return `
      background-color: var(--gray-200);
      color: var(--gray-700);
    `;
  }}
`;

// ========================================
// BADGE COMPONENT
// ========================================

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
  ...rest
}) => {
  return (
    <StyledBadge $variant={variant} $size={size} {...rest}>
      {children || variant} {/* Use children if provided, otherwise use variant */}
    </StyledBadge>
  );
};

export default Badge;
