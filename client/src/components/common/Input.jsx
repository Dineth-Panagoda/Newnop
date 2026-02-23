// ========================================
// INPUT COMPONENT
// ========================================
// Reusable input field with label, error message, and validation

import styled from 'styled-components';

// ========================================
// STYLED COMPONENTS
// ========================================

// Container for the entire input group
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 100%;
`;

// Label element
const Label = styled.label`
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-700);

  /* Show asterisk for required fields */
  ${props => props.$required && `
    &::after {
      content: ' *';
      color: var(--danger-color);
    }
  `}
`;

// Input field
const StyledInput = styled.input`
  padding: 0.625rem 0.875rem;
  font-size: var(--text-base);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  width: 100%;

  /* Focus state */
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Error state */
  ${props => props.$hasError && `
    border-color: var(--danger-color);

    &:focus {
      border-color: var(--danger-color);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}

  /* Disabled state */
  &:disabled {
    background-color: var(--gray-100);
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Placeholder styling */
  &::placeholder {
    color: var(--gray-400);
  }
`;

// Textarea variant
const StyledTextarea = styled.textarea`
  padding: 0.625rem 0.875rem;
  font-size: var(--text-base);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  width: 100%;
  font-family: inherit; /* Use same font as body */
  resize: vertical; /* Allow vertical resizing only */
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  ${props => props.$hasError && `
    border-color: var(--danger-color);

    &:focus {
      border-color: var(--danger-color);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}

  &:disabled {
    background-color: var(--gray-100);
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::placeholder {
    color: var(--gray-400);
  }
`;

// Error message text
const ErrorMessage = styled.span`
  font-size: var(--text-sm);
  color: var(--danger-color);
  margin-top: 0.25rem;
`;

// Helper text (for additional info)
const HelperText = styled.span`
  font-size: var(--text-sm);
  color: var(--gray-500);
  margin-top: 0.25rem;
`;

// ========================================
// INPUT COMPONENT
// ========================================

/**
 * Input component props:
 * @param {string} label - Label text for the input
 * @param {string} type - Input type (text, email, password, etc.)
 * @param {string} name - Input name attribute
 * @param {string} value - Input value (controlled component)
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Mark field as required
 * @param {boolean} disabled - Disable input
 * @param {string} error - Error message to display
 * @param {string} helperText - Helper text to display
 * @param {boolean} multiline - Render as textarea instead of input
 * @param {number} rows - Number of rows for textarea
 */
const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  multiline = false,
  rows = 3,
  ...rest
}) => {
  return (
    <InputContainer>
      {/* Render label if provided */}
      {label && (
        <Label htmlFor={name} $required={required}>
          {label}
        </Label>
      )}

      {/* Render textarea or input based on multiline prop */}
      {multiline ? (
        <StyledTextarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          $hasError={!!error}
          {...rest}
        />
      ) : (
        <StyledInput
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          $hasError={!!error}
          {...rest}
        />
      )}

      {/* Show error message if exists */}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {/* Show helper text if exists and no error */}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </InputContainer>
  );
};

export default Input;
