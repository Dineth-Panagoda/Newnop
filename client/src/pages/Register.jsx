// ========================================
// REGISTER PAGE
// ========================================
// User registration form with email, password, and name

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { registerUser, clearError } from '../redux/slices/authSlice';
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

const RegisterCard = styled(Card)`
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
// REGISTER COMPONENT
// ========================================

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get auth state from Redux
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Local form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

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

    // Name validation (optional but recommended)
    if (formData.name && formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Prepare data (don't send confirmPassword to API)
    const { confirmPassword, ...userData } = formData;

    // Dispatch register action
    const result = await dispatch(registerUser(userData));

    // Check if registration was successful
    if (registerUser.fulfilled.match(result)) {
      // Registration successful - redirect to dashboard
      navigate('/dashboard');
    }
    // If registration failed, error will be shown from Redux state
  };

  return (
    <PageContainer>
      <RegisterCard>
        <Title>Create Account</Title>
        <Subtitle>Sign up to start tracking issues</Subtitle>

        {/* Show error from API if exists */}
        {error && <ErrorAlert>{error}</ErrorAlert>}

        <Form onSubmit={handleSubmit}>
          {/* Name input (optional) */}
          <Input
            label="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            error={formErrors.name}
            helperText="Optional"
          />

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
            placeholder="Minimum 6 characters"
            error={formErrors.password}
            required
          />

          {/* Confirm password input */}
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            error={formErrors.confirmPassword}
            required
          />

          {/* Submit button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </Form>

        {/* Link to login page */}
        <Footer>
          Already have an account?{' '}
          <StyledLink to="/login">Sign in</StyledLink>
        </Footer>
      </RegisterCard>
    </PageContainer>
  );
};

export default Register;
