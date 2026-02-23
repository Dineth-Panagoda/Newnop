// ========================================
// CLASSNAME UTILITY
// ========================================
// Helper function to conditionally combine CSS class names

/**
 * Combines multiple class names, filtering out falsy values
 * This is useful for conditional styling
 *
 * @param {...(string|boolean|null|undefined)} classes - Class names to combine
 * @returns {string} Combined class names
 *
 * @example
 * classNames('button', isActive && 'active', 'primary')
 * // Returns: 'button active primary' (if isActive is true)
 * // Returns: 'button primary' (if isActive is false)
 */
export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export default classNames;
