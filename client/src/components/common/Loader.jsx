// ========================================
// LOADER COMPONENT
// ========================================
// Loading spinner to indicate async operations

import styled from 'styled-components';

// ========================================
// STYLED COMPONENTS
// ========================================

// Container for centering loader
const LoaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  width: 100%;

  ${props => props.$fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.9);
    z-index: 999;
  `}
`;

// Spinner animation
const Spinner = styled.div`
  border: 3px solid var(--gray-200);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  width: ${props => props.$size === 'small' ? '24px' : props.$size === 'large' ? '56px' : '40px'};
  height: ${props => props.$size === 'small' ? '24px' : props.$size === 'large' ? '56px' : '40px'};
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Loading text (optional)
const LoadingText = styled.p`
  margin-left: var(--spacing-md);
  font-size: var(--text-base);
  color: var(--gray-600);
`;

// ========================================
// LOADER COMPONENT
// ========================================

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
  ...rest
}) => {
  return (
    <LoaderContainer $fullScreen={fullScreen} {...rest}>
      <Spinner $size={size} />
      {text && <LoadingText>{text}</LoadingText>}
    </LoaderContainer>
  );
};

export default Loader;
