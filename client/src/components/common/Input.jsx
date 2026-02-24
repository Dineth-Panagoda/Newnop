// ========================================
// INPUT COMPONENT
// ========================================
// Reusable input field with label, error message, and validation

import './Input.css';
import classNames from '../../utils/classNames';

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
 * @param {boolean} showFilledState - Show green border when field has value
 * @param {number} maxLength - Maximum character length (shows counter)
 * @param {boolean} showCharCount - Force show character counter even without maxLength
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
  showFilledState = false,
  maxLength,
  showCharCount = false,
  className,
  ...rest
}) => {
  // Determine input/textarea class names
  const inputClasses = classNames(
    multiline ? 'textarea' : 'input',
    error && (multiline ? 'textarea-error' : 'input-error'),
    showFilledState && value && (multiline ? 'textarea-filled' : 'input-filled'),
    className
  );

  const labelClasses = classNames(
    'label',
    required && 'label-required'
  );

  // Calculate character count
  const currentLength = value ? value.length : 0;
  const showCounter = maxLength || showCharCount;
  const isNearLimit = maxLength && currentLength > maxLength * 0.8;
  const isAtLimit = maxLength && currentLength >= maxLength;

  return (
    <div className="inputContainer">
      {/* Render label with character counter */}
      {(label || showCounter) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && (
            <label htmlFor={name} className={labelClasses}>
              {label}
            </label>
          )}

          {showCounter && (
            <span
              className="charCounter"
              style={{
                fontSize: '0.875rem',
                color: isAtLimit ? 'var(--red-600)' : isNearLimit ? 'var(--orange-600)' : 'var(--gray-500)',
                fontWeight: isAtLimit ? '600' : '400'
              }}
            >
              {currentLength}{maxLength && `/${maxLength}`}
            </span>
          )}
        </div>
      )}

      {/* Render textarea or input based on multiline prop */}
      {multiline ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={inputClasses}
          {...rest}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          className={inputClasses}
          {...rest}
        />
      )}

      {/* Show error message if exists */}
      {error && <span className="errorMessage">{error}</span>}

      {/* Show helper text if exists and no error */}
      {helperText && !error && <span className="helperText">{helperText}</span>}
    </div>
  );
};

export default Input;
