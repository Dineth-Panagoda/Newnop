// ========================================
// SELECT COMPONENT
// ========================================
// Reusable dropdown select with label and error handling

import styles from './Select.module.css';
import classNames from '../../utils/classNames';

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
  className,
  ...rest
}) => {
  const selectClasses = classNames(
    styles.select,
    error && styles['select-error'],
    className
  );

  const labelClasses = classNames(
    styles.label,
    required && styles['label-required']
  );

  return (
    <div className={styles.selectContainer}>
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={selectClasses}
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
      </select>

      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default Select;
