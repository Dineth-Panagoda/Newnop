// ========================================
// NAVBAR COMPONENT
// ========================================
// Top navigation bar with logo, navigation links, and logout

import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './Navbar.css';
import { logout } from '../redux/slices/authSlice';
import Button from './common/Button';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user info from Redux store
  const { user } = useSelector((state) => state.auth);

  // Handle logout
  const handleLogout = () => {
    // Dispatch logout action (clears state and localStorage)
    dispatch(logout());

    // Redirect to login page
    navigate('/login');
  };

  return (
    <nav className="nav">
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
                <span className="dropdownArrow">▼</span>
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
