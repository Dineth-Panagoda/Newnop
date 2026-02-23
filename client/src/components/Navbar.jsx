// ========================================
// NAVBAR COMPONENT
// ========================================
// Top navigation bar with logo, navigation links, and logout

import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { logout } from '../redux/slices/authSlice';
import Button from './common/Button';

// ========================================
// STYLED COMPONENTS
// ========================================

const Nav = styled.nav`
  background-color: white;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
`;

const Logo = styled(Link)`
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--primary-color);
  text-decoration: none;

  &:hover {
    color: var(--primary-dark);
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
`;

const NavLink = styled(Link)`
  color: var(--gray-700);
  text-decoration: none;
  font-weight: var(--font-medium);
  transition: color 0.2s;

  &:hover {
    color: var(--primary-color);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const UserEmail = styled.span`
  font-size: var(--text-sm);
  color: var(--gray-600);

  /* Hide on small screens */
  @media (max-width: 768px) {
    display: none;
  }
`;

// ========================================
// NAVBAR COMPONENT
// ========================================

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
    <Nav>
      <NavContainer>
        {/* Logo */}
        <Logo to="/dashboard">Issue Tracker</Logo>

        {/* Right side: Nav links and user info */}
        <UserInfo>
          <NavLinks>
            {/* Link to dashboard */}
            <NavLink to="/dashboard">Dashboard</NavLink>

            {/* Link to create new issue */}
            <NavLink to="/issues/create">New Issue</NavLink>
          </NavLinks>

          {/* Display user email */}
          {user && <UserEmail>{user.email}</UserEmail>}

          {/* Logout button */}
          <Button variant="ghost" size="small" onClick={handleLogout}>
            Logout
          </Button>
        </UserInfo>
      </NavContainer>
    </Nav>
  );
};

export default Navbar;
