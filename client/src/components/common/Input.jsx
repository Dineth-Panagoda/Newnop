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
  className,
  ...rest
}) => {
  // Determine input/textarea class names
  const inputClasses = classNames(
    multiline ? 'textarea' : 'input',
    error && (multiline ? 'textarea-error' : 'input-error'),
    className
  );

  const labelClasses = classNames(
    'label',
    required && 'label-required'
  );

  return (
    <div className="inputContainer">
      {/* Render label if provided */}
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label}
        </label>
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
