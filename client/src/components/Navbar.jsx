// ========================================
// NAVBAR COMPONENT
// ========================================
// Top navigation bar with logo, navigation links, and logout

import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import './Navbar.css';
import { logout } from '../redux/slices/authSlice';
import Button from './common/Button';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user info from Redux store
  const { user } = useSelector((state) => state.auth);

  // Scroll state
  const [scrollDirection, setScrollDirection] = useState('up');
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;

      // Check if at top
      setIsAtTop(currentScrollPos < 10);

      // Determine scroll direction
      if (currentScrollPos > prevScrollPos && currentScrollPos > 80) {
        // Scrolling down
        setScrollDirection('down');
      } else if (currentScrollPos < prevScrollPos) {
        // Scrolling up
        setScrollDirection('up');
      }

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  // Handle logout
  const handleLogout = () => {
    // Dispatch logout action (clears state and localStorage)
    dispatch(logout());

    // Redirect to login page
    navigate('/login');
  };

  // Determine navbar classes
  const navClasses = `nav ${!isAtTop ? 'nav-shrunk' : ''} ${scrollDirection === 'down' && !isAtTop ? 'nav-hidden' : ''}`;

  return (
    <nav className={navClasses}>
      <div className="navContainer">
        {/* Logo */}
        <Link to="/dashboard" className="logo">
          IssueTrackr.
        </Link>

        {/* Right side: Nav links and user info */}
        <div className="userInfo">
        

          {/* User dropdown menu */}
          {user && (
            <div className="userMenu">
              <div className="userMenuTrigger">
                <span className="userName">{user.name || user.email}</span>
                <KeyboardArrowDownOutlinedIcon className="dropdownArrow" />
              </div>

              <div className="userDropdown">
                <div className="dropdownEmail">{user.email}</div>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={handleLogout}
                  className="dropdownLogout"
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
