// ========================================
// CARD COMPONENT
// ========================================
// Container component for displaying content in a card layout

import './Card.css';
import classNames from '../../utils/classNames';

/**
 * Card component props:
 * @param {ReactNode} children - Card content
 * @param {boolean} hoverable - Enable hover effect
 * @param {string} padding - Padding size: 'none', 'small', 'medium', 'large'
 * @param {function} onClick - Click handler (if hoverable)
 */
const Card = ({
  children,
  hoverable = false,
  padding = 'medium',
  onClick,
  className,
  ...rest
}) => {
  const cardClasses = classNames(
    "card",
    hoverable && 'card-hoverable',
    padding && `card-${padding}`,
    className
  );

  return (
    <div className={cardClasses} onClick={onClick} {...rest}>
      {children}
    </div>
  );
};

// Card Header sub-component
const CardHeader = ({ children, noPadding, noBorder, className, ...rest }) => {
  const headerClasses = classNames(
    "cardHeader",
    noPadding && 'cardHeader-noPadding',
    noBorder && 'cardHeader-noBorder',
    className
  );

  return (
    <div className={headerClasses} {...rest}>
      {children}
    </div>
  );
};

// Card Body sub-component
const CardBody = ({ children, noPadding, className, ...rest }) => {
  const bodyClasses = classNames(
    "cardBody",
    noPadding && 'cardBody-noPadding',
    className
  );

  return (
    <div className={bodyClasses} {...rest}>
      {children}
    </div>
  );
};

// Card Footer sub-component
const CardFooter = ({ children, noPadding, noBorder, className, ...rest }) => {
  const footerClasses = classNames(
    "cardFooter",
    noPadding && 'cardFooter-noPadding',
    noBorder && 'cardFooter-noBorder',
    className
  );

  return (
    <div className={footerClasses} {...rest}>
      {children}
    </div>
  );
};

// Card Title sub-component
const CardTitle = ({ children, className, ...rest }) => {
  const titleClasses = classNames("cardTitle", className);

  return (
    <h3 className={titleClasses} {...rest}>
      {children}
    </h3>
  );
};

// Card Subtitle sub-component
const CardSubtitle = ({ children, className, ...rest }) => {
  const subtitleClasses = classNames("cardSubtitle", className);

  return (
    <p className={subtitleClasses} {...rest}>
      {children}
    </p>
  );
};

// Export sub-components for flexible card composition
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;

export default Card;
