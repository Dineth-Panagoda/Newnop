// ========================================
// CARD COMPONENT
// ========================================
// Container component for displaying content in a card layout

import styled from 'styled-components';

// ========================================
// STYLED COMPONENTS
// ========================================

// Main card container
const StyledCard = styled.div`
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden; /* Ensure rounded corners work with child elements */
  transition: all 0.2s ease;

  /* Hover effect (optional, enabled with $hoverable prop) */
  ${props => props.$hoverable && `
    cursor: pointer;

    &:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }
  `}

  /* Padding variant */
  ${props => {
    if (props.$padding === 'none') return 'padding: 0;';
    if (props.$padding === 'small') return 'padding: var(--spacing-md);';
    if (props.$padding === 'large') return 'padding: var(--spacing-xl);';
    return 'padding: var(--spacing-lg);'; // default
  }}
`;

// Card header section
const CardHeader = styled.div`
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--gray-200);

  ${props => props.$noPadding && 'padding: 0;'}
  ${props => props.$noBorder && 'border-bottom: none;'}
`;

// Card body section
const CardBody = styled.div`
  padding: var(--spacing-lg);

  ${props => props.$noPadding && 'padding: 0;'}
`;

// Card footer section
const CardFooter = styled.div`
  padding: var(--spacing-lg);
  border-top: 1px solid var(--gray-200);
  background-color: var(--gray-50);

  ${props => props.$noPadding && 'padding: 0;'}
  ${props => props.$noBorder && 'border-top: none; background-color: transparent;'}
`;

// Card title
const CardTitle = styled.h3`
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
`;

// Card subtitle
const CardSubtitle = styled.p`
  margin: 0.25rem 0 0 0;
  font-size: var(--text-sm);
  color: var(--gray-600);
`;

// ========================================
// CARD COMPONENT
// ========================================

/**
 * Card component props:
 * @param {ReactNode} children - Card content
 * @param {boolean} hoverable - Enable hover effect
 * @param {string} padding - Padding size: 'none', 'small', 'medium', 'large'
 * @param {function} onClick - Click handler (if hoverable)
 */
const Card = ({
  children,
  hoverable = false,
  padding = 'medium',
  onClick,
  ...rest
}) => {
  return (
    <StyledCard
      $hoverable={hoverable}
      $padding={padding}
      onClick={onClick}
      {...rest}
    >
      {children}
    </StyledCard>
  );
};

// Export sub-components for flexible card composition
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;

export default Card;
