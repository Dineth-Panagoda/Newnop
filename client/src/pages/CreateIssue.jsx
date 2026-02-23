// ========================================
// CREATE ISSUE PAGE
// ========================================
// Form to create a new issue

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './CreateIssue.module.css';
import { createIssue } from '../redux/slices/issuesSlice';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';

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
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create New Issue</h1>

      <Card>
        {/* Show error if exists */}
        {error && <div className={styles.errorAlert}>{error}</div>}

        {/* Show success message */}
        {successMessage && <div className={styles.successAlert}>{successMessage}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
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
          <div className={styles.formRow}>
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
          </div>

          {/* Action buttons */}
          <div className={styles.buttonGroup}>
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
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateIssue;
