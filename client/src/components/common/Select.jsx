// ========================================
// SELECT COMPONENT
// ========================================
// Reusable dropdown select with label and error handling

import styled from 'styled-components';

// ========================================
// STYLED COMPONENTS
// ========================================

const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 100%;
`;

const Label = styled.label`
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-700);

  ${props => props.$required && `
    &::after {
      content: ' *';
      color: var(--danger-color);
    }
  `}
`;

const StyledSelect = styled.select`
  padding: 0.625rem 0.875rem;
  font-size: var(--text-base);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  width: 100%;
  background-color: white;
  cursor: pointer;

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
`;

const ErrorMessage = styled.span`
  font-size: var(--text-sm);
  color: var(--danger-color);
  margin-top: 0.25rem;
`;

// ========================================
// SELECT COMPONENT
// ========================================

/**
 * Select component props:
 * @param {string} label - Label text for the select
 * @param {string} name - Select name attribute
 * @param {string} value - Selected value (controlled component)
 * @param {function} onChange - Change handler
 * @param {array} options - Array of options: [{ value, label }] or simple array of strings
 * @param {boolean} required - Mark field as required
 * @param {boolean} disabled - Disable select
 * @param {string} error - Error message to display
 * @param {string} placeholder - Placeholder option text
 */
const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
  placeholder = 'Select an option',
  ...rest
}) => {
  return (
    <SelectContainer>
      {label && (
        <Label htmlFor={name} $required={required}>
          {label}
        </Label>
      )}

      <StyledSelect
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        $hasError={!!error}
        {...rest}
      >
        {/* Placeholder option */}
        <option value="">{placeholder}</option>

        {/* Render options */}
        {options.map((option, index) => {
          // Handle both object and string options
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;

          return (
            <option key={index} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </StyledSelect>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </SelectContainer>
  );
};

export default Select;
