// ========================================
// CREATE ISSUE PAGE
// ========================================
// Form to create a new issue

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { createIssue } from '../redux/slices/issuesSlice';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';

// ========================================
// STYLED COMPONENTS
// ========================================

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
`;

const Title = styled.h1`
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-md);
`;

const ErrorAlert = styled.div`
  padding: var(--spacing-md);
  background-color: var(--danger-light);
  border: 1px solid var(--danger-color);
  border-radius: var(--radius-md);
  color: var(--danger-color);
  font-size: var(--text-sm);
`;

const SuccessAlert = styled.div`
  padding: var(--spacing-md);
  background-color: var(--success-light);
  border: 1px solid var(--success-color);
  border-radius: var(--radius-md);
  color: var(--success-color);
  font-size: var(--text-sm);
`;

// ========================================
// CREATE ISSUE COMPONENT
// ========================================

const CreateIssue = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get loading and error state from Redux
  const { actionLoading, error } = useSelector((state) => state.issues);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Open',
    priority: 'Medium',
    severity: 'Medium'
  });

  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

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

    // Clear success message on any change
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
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

    // Dispatch create issue action
    const result = await dispatch(createIssue(formData));

    // Check if creation was successful
    if (createIssue.fulfilled.match(result)) {
      // Show success message
      setSuccessMessage('Issue created successfully!');

      // Redirect to issue detail page after a short delay
      setTimeout(() => {
        navigate(`/issues/${result.payload.id}`);
      }, 1000);
    }
    // If failed, error will be shown from Redux state
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <Container>
      <Title>Create New Issue</Title>

      <Card>
        {/* Show error if exists */}
        {error && <ErrorAlert>{error}</ErrorAlert>}

        {/* Show success message */}
        {successMessage && <SuccessAlert>{successMessage}</SuccessAlert>}

        <Form onSubmit={handleSubmit}>
          {/* Title input */}
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief description of the issue"
            error={formErrors.title}
            required
          />

          {/* Description input (multiline) */}
          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of the issue..."
            error={formErrors.description}
            multiline
            rows={6}
            required
          />

          {/* Status, Priority, and Severity in a row */}
          <FormRow>
            {/* Status select */}
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'Open', label: 'Open' },
                { value: 'InProgress', label: 'In Progress' },
                { value: 'Resolved', label: 'Resolved' },
                { value: 'Closed', label: 'Closed' }
              ]}
              required
            />

            {/* Priority select */}
            <Select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' }
              ]}
              required
            />

            {/* Severity select */}
            <Select
              label="Severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' }
              ]}
              required
            />
          </FormRow>

          {/* Action buttons */}
          <ButtonGroup>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={actionLoading}
            >
              {actionLoading ? 'Creating...' : 'Create Issue'}
            </Button>
          </ButtonGroup>
        </Form>
      </Card>
    </Container>
  );
};

export default CreateIssue;
