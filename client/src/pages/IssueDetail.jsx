// ========================================
// ISSUE DETAIL PAGE
// ========================================
// View and edit issue details with confirmation modals for critical actions

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  fetchIssueById,
  updateIssue,
  deleteIssue,
  clearCurrentIssue
} from '../redux/slices/issuesSlice';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import { ConfirmModal } from '../components/common/Modal';

// ========================================
// STYLED COMPONENTS
// ========================================

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-md);
  flex-wrap: wrap;
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
`;

const IssueId = styled.span`
  color: var(--gray-500);
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
`;

const Badges = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
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

const Metadata = styled.div`
  padding: var(--spacing-md);
  background-color: var(--gray-50);
  border-radius: var(--radius-md);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  font-size: var(--text-sm);
`;

const MetadataItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const MetadataLabel = styled.span`
  color: var(--gray-500);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: var(--text-xs);
`;

const MetadataValue = styled.span`
  color: var(--gray-900);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: space-between;
  margin-top: var(--spacing-md);
`;

const LeftButtons = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const ErrorAlert = styled.div`
  padding: var(--spacing-md);
  background-color: var(--danger-light);
  border: 1px solid var(--danger-color);
  border-radius: var(--radius-md);
  color: var(--danger-color);
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-md);
`;

const SuccessAlert = styled.div`
  padding: var(--spacing-md);
  background-color: var(--success-light);
  border: 1px solid var(--success-color);
  border-radius: var(--radius-md);
  color: var(--success-color);
  font-size: var(--text-sm);
  margin-bottom: var(--spacing-md);
`;

// ========================================
// ISSUE DETAIL COMPONENT
// ========================================

const IssueDetail = () => {
  const { id } = useParams(); // Get issue ID from URL
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux
  const { currentIssue, loading, actionLoading, error } = useSelector(
    (state) => state.issues
  );

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    severity: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch issue on mount
  useEffect(() => {
    dispatch(fetchIssueById(id));

    // Cleanup: Clear current issue when component unmounts
    return () => {
      dispatch(clearCurrentIssue());
    };
  }, [dispatch, id]);

  // Update form data when issue is loaded
  useEffect(() => {
    if (currentIssue) {
      setFormData({
        title: currentIssue.title,
        description: currentIssue.description,
        status: currentIssue.status,
        priority: currentIssue.priority,
        severity: currentIssue.severity
      });
    }
  }, [currentIssue]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear success message
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save
  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await dispatch(updateIssue({ id, data: formData }));

    if (updateIssue.fulfilled.match(result)) {
      setSuccessMessage('Issue updated successfully!');
      setIsEditing(false);

      // Refetch issue statistics
      dispatch(fetchIssueById(id));
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reset form data to original issue data
    if (currentIssue) {
      setFormData({
        title: currentIssue.title,
        description: currentIssue.description,
        status: currentIssue.status,
        priority: currentIssue.priority,
        severity: currentIssue.severity
      });
    }
    setFormErrors({});
    setIsEditing(false);
  };

  // Handle mark as resolved
  const handleMarkResolved = async () => {
    const result = await dispatch(updateIssue({
      id,
      data: { status: 'Resolved' }
    }));

    if (updateIssue.fulfilled.match(result)) {
      setSuccessMessage('Issue marked as resolved!');
      setShowResolveModal(false);
    }
  };

  // Handle mark as closed
  const handleMarkClosed = async () => {
    const result = await dispatch(updateIssue({
      id,
      data: { status: 'Closed' }
    }));

    if (updateIssue.fulfilled.match(result)) {
      setSuccessMessage('Issue marked as closed!');
      setShowCloseModal(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    const result = await dispatch(deleteIssue(id));

    if (deleteIssue.fulfilled.match(result)) {
      // Redirect to dashboard after successful deletion
      navigate('/dashboard');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loader while fetching
  if (loading) {
    return <Loader fullScreen text="Loading issue..." />;
  }

  // Show error if issue not found
  if (!currentIssue && !loading) {
    return (
      <Container>
        <ErrorAlert>Issue not found</ErrorAlert>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <Header>
        <HeaderLeft>
          <Title>
            <IssueId>#{currentIssue.id}</IssueId> {currentIssue.title}
          </Title>
          <Badges>
            <Badge variant={currentIssue.status} size="large">
              {currentIssue.status}
            </Badge>
            <Badge variant={currentIssue.priority} size="large">
              Priority: {currentIssue.priority}
            </Badge>
            <Badge variant={currentIssue.severity} size="large">
              Severity: {currentIssue.severity}
            </Badge>
          </Badges>
        </HeaderLeft>

        <HeaderActions>
          <Button variant="ghost" size="small" onClick={() => navigate('/dashboard')}>
            ← Back
          </Button>

          {!isEditing && (
            <Button variant="primary" size="small" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </HeaderActions>
      </Header>

      <Card>
        {/* Show error */}
        {error && <ErrorAlert>{error}</ErrorAlert>}

        {/* Show success message */}
        {successMessage && <SuccessAlert>{successMessage}</SuccessAlert>}

        {isEditing ? (
          // Edit mode
          <Form onSubmit={handleSave}>
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={formErrors.title}
              required
            />

            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={formErrors.description}
              multiline
              rows={8}
              required
            />

            <FormRow>
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={['Open', 'InProgress', 'Resolved', 'Closed']}
                required
              />

              <Select
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={['Low', 'Medium', 'High', 'Critical']}
                required
              />

              <Select
                label="Severity"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                options={['Low', 'Medium', 'High', 'Critical']}
                required
              />
            </FormRow>

            <ButtonGroup>
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                disabled={actionLoading}
              >
                Delete Issue
              </Button>

              <LeftButtons>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>

                <Button type="submit" variant="primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </LeftButtons>
            </ButtonGroup>
          </Form>
        ) : (
          // View mode
          <>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <h3 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--gray-700)' }}>
                Description
              </h3>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {currentIssue.description}
              </p>
            </div>

            <Metadata>
              <MetadataItem>
                <MetadataLabel>Created</MetadataLabel>
                <MetadataValue>{formatDate(currentIssue.createdAt)}</MetadataValue>
              </MetadataItem>

              <MetadataItem>
                <MetadataLabel>Last Updated</MetadataLabel>
                <MetadataValue>{formatDate(currentIssue.updatedAt)}</MetadataValue>
              </MetadataItem>

              <MetadataItem>
                <MetadataLabel>Created By</MetadataLabel>
                <MetadataValue>{currentIssue.user?.email || 'Unknown'}</MetadataValue>
              </MetadataItem>
            </Metadata>

            <ButtonGroup style={{ marginTop: 'var(--spacing-xl)' }}>
              <LeftButtons>
                {currentIssue.status !== 'Resolved' && currentIssue.status !== 'Closed' && (
                  <Button
                    variant="success"
                    onClick={() => setShowResolveModal(true)}
                  >
                    Mark as Resolved
                  </Button>
                )}

                {currentIssue.status !== 'Closed' && (
                  <Button
                    variant="secondary"
                    onClick={() => setShowCloseModal(true)}
                  >
                    Mark as Closed
                  </Button>
                )}
              </LeftButtons>

              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Issue
              </Button>
            </ButtonGroup>
          </>
        )}
      </Card>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="Mark as Resolved"
        message="Are you sure you want to mark this issue as resolved?"
        confirmText="Yes, Mark as Resolved"
        confirmVariant="success"
        onConfirm={handleMarkResolved}
        loading={actionLoading}
      />

      <ConfirmModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Close Issue"
        message="Are you sure you want to close this issue?"
        confirmText="Yes, Close Issue"
        confirmVariant="secondary"
        onConfirm={handleMarkClosed}
        loading={actionLoading}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Issue"
        message="Are you sure you want to delete this issue? This action cannot be undone."
        confirmText="Yes, Delete Issue"
        confirmVariant="danger"
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </Container>
  );
};

export default IssueDetail;
