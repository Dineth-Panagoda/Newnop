// ========================================
// LOGIN PAGE
// ========================================
// User login form with email and password

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { loginUser, clearError } from '../redux/slices/authSlice';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

// ========================================
// STYLED COMPONENTS
// ========================================

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const LoginCard = styled(Card)`
  max-width: 440px;
  width: 100%;
`;

const Title = styled.h1`
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  text-align: center;
`;

const Subtitle = styled.p`
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--text-base);
  color: var(--gray-600);
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const ErrorAlert = styled.div`
  padding: var(--spacing-md);
  background-color: var(--danger-light);
  border: 1px solid var(--danger-color);
  border-radius: var(--radius-md);
  color: var(--danger-color);
  font-size: var(--text-sm);
`;

const Footer = styled.div`
  margin-top: var(--spacing-lg);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--gray-600);
`;

const StyledLink = styled(Link)`
  color: var(--primary-color);
  font-weight: var(--font-medium);

  &:hover {
    color: var(--primary-dark);
  }
`;

// ========================================
// LOGIN COMPONENT
// ========================================

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get auth state from Redux
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Local form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect to dashboard if already authenticated
  // This shouldn't happen due to route protection, but good to have as fallback
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Dispatch login action
    // This is an async thunk that will make API call
    const result = await dispatch(loginUser(formData));

    // Check if login was successful
    if (loginUser.fulfilled.match(result)) {
      // Login successful - Redux will update state and redirect will happen via useEffect
      navigate('/dashboard');
    }
    // If login failed, error will be shown from Redux state
  };

  return (
    <PageContainer>
      <LoginCard>
        <Title>Welcome Back</Title>
        <Subtitle>Sign in to your account to continue</Subtitle>

        {/* Show error from API if exists */}
        {error && <ErrorAlert>{error}</ErrorAlert>}

        <Form onSubmit={handleSubmit}>
          {/* Email input */}
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            error={formErrors.email}
            required
          />

          {/* Password input */}
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            error={formErrors.password}
            required
          />

          {/* Submit button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>

        {/* Link to register page */}
        <Footer>
          Don't have an account?{' '}
          <StyledLink to="/register">Create one</StyledLink>
        </Footer>
      </LoginCard>
    </PageContainer>
  );
};

export default Login;
