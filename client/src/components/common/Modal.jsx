// ========================================
// MODAL COMPONENT
// ========================================
// Overlay dialog for confirmations, forms, and messages

import { useEffect } from 'react';
import './Modal.css';
import classNames from '../../utils/classNames';
import Button from './Button';

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
  className,
  ...rest
}) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

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
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalClasses = classNames(
    "modalContainer",
    `modalContainer-${size}`,
    className
  );

  return (
    <div className="overlay" onClick={handleOverlayClick}>
      <div className={modalClasses} {...rest}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="modalHeader">
            {title && <h2 className="modalTitle">{title}</h2>}
            {showCloseButton && (
              <button
                className="closeButton"
                onClick={onClose}
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="modalBody">{children}</div>

        {/* Footer (if provided) */}
        {footer && <div className="modalFooter">{footer}</div>}
      </div>
    </div>
  );
};

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
      <p className="confirmMessage">{message}</p>
    </Modal>
  );
};

export default Modal;
