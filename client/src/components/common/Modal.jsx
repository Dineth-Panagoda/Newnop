// ========================================
// MODAL COMPONENT
// ========================================
// Overlay dialog for confirmations, forms, and messages

import { useEffect } from 'react';
import styled from 'styled-components';
import Button from './Button';

// ========================================
// STYLED COMPONENTS
// ========================================

// Modal overlay (darkened background)
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* Ensure modal appears above everything */
  padding: var(--spacing-md);

  /* Fade-in animation */
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

// Modal container
const ModalContainer = styled.div`
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-width: ${props => props.$size === 'small' ? '400px' : props.$size === 'large' ? '800px' : '600px'};
  width: 100%;
  max-height: 90vh; /* Limit height to viewport */
  overflow-y: auto; /* Scroll if content is too long */

  /* Slide-up animation */
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

// Modal header
const ModalHeader = styled.div`
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// Modal title
const ModalTitle = styled.h2`
  margin: 0;
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
`;

// Close button
const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: var(--text-2xl);
  color: var(--gray-400);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--gray-100);
    color: var(--gray-600);
  }
`;

// Modal body
const ModalBody = styled.div`
  padding: var(--spacing-lg);
`;

// Modal footer
const ModalFooter = styled.div`
  padding: var(--spacing-lg);
  border-top: 1px solid var(--gray-200);
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
`;

// ========================================
// MODAL COMPONENT
// ========================================

/**
 * Modal component props:
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Called when modal should close
 * @param {string} title - Modal title
 * @param {ReactNode} children - Modal content
 * @param {string} size - Modal size: 'small', 'medium', 'large'
 * @param {boolean} showCloseButton - Show X button in header
 * @param {boolean} closeOnOverlayClick - Close modal when clicking outside
 * @param {ReactNode} footer - Custom footer content
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
  ...rest
}) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save original overflow value
      const originalOverflow = document.body.style.overflow;

      // Disable scrolling
      document.body.style.overflow = 'hidden';

      // Re-enable scrolling when modal closes or component unmounts
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  // Handle overlay click
  const handleOverlayClick = (e) => {
    // Only close if clicking the overlay itself, not its children
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalContainer $size={size} {...rest}>
        {/* Header */}
        {(title || showCloseButton) && (
          <ModalHeader>
            {title && <ModalTitle>{title}</ModalTitle>}
            {showCloseButton && (
              <CloseButton onClick={onClose} aria-label="Close modal">
                ×
              </CloseButton>
            )}
          </ModalHeader>
        )}

        {/* Body */}
        <ModalBody>{children}</ModalBody>

        {/* Footer (if provided) */}
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </Overlay>
  );
};

// ========================================
// CONFIRMATION MODAL VARIANT
// ========================================

/**
 * Pre-configured confirmation modal with confirm/cancel buttons
 * @param {string} confirmText - Text for confirm button
 * @param {string} cancelText - Text for cancel button
 * @param {function} onConfirm - Called when confirm is clicked
 * @param {string} confirmVariant - Button variant for confirm button
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  confirmVariant = 'primary',
  loading = false,
  ...rest
}) => {
  const handleConfirm = () => {
    onConfirm();
    // Note: Don't auto-close here - let parent component handle it
    // This allows for async operations and error handling
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={handleConfirm} disabled={loading}>
            {loading ? 'Processing...' : confirmText}
          </Button>
        </>
      }
      {...rest}
    >
      <p style={{ margin: 0, color: 'var(--gray-700)' }}>{message}</p>
    </Modal>
  );
};

export default Modal;
