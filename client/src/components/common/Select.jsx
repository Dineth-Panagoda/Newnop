// ========================================
// SELECT COMPONENT
// ========================================
// Reusable dropdown select with label and error handling

import './Select.css';
import classNames from '../../utils/classNames';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';

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
 * @param {boolean} showFilledState - Show green border when field has value
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
  showFilledState = false,
  className,
  ...rest
}) => {
  const selectClasses = classNames(
    "select",
    error && 'select-error',
    showFilledState && value && 'select-filled',
    className
  );

  const labelClasses = classNames(
    "label",
    required && 'label-required'
  );

  return (
    <div className="selectContainer">
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label}
        </label>
      )}

      <div className="selectWrapper">
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
        <KeyboardArrowDownOutlinedIcon className="selectArrow" />
      </div>

      {error && <span className="errorMessage">{error}</span>}
    </div>
  );
};

export default Select;
