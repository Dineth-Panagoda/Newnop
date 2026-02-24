// ========================================
// ISSUE DETAIL PAGE
// ========================================
// View and edit issue details with confirmation modals for critical actions

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './IssueDetail.css';
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

const IssueDetail = () => {
  const { id } = useParams();
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

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

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
      dispatch(fetchIssueById(id));
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
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
      <div className="container">
        <div className="errorAlert">Issue not found</div>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div className="headerLeft">
          
          <div className="badges">
            <Badge variant={currentIssue.status} size="large">
              {currentIssue.status}
            </Badge>
            <Badge variant={currentIssue.priority} size="large">
              Priority: {currentIssue.priority}
            </Badge>
            <Badge variant={currentIssue.severity} size="large">
              Severity: {currentIssue.severity}
            </Badge>
          </div>
        </div>

        <div className="headerActions">
          <Button variant="ghost" size="small" onClick={() => navigate('/dashboard')}>
            ← Back
          </Button>

          {!isEditing && (
            <Button variant="primary" size="small" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      <Card>
        {/* Show error */}
        {error && <div className="errorAlert">{error}</div>}

        {/* Show success message */}
        {successMessage && <div className="successAlert">{successMessage}</div>}

        {isEditing ? (
          // Edit mode
          <form className="form" onSubmit={handleSave}>
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

            <div className="formRow">
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
            </div>

            <div className="buttonGroup">
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                disabled={actionLoading}
              >
                Delete Issue
              </Button>

              <div className="leftButtons">
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
              </div>
            </div>
          </form>
        ) : (
          // View mode
          <>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h1 className="title">
                  <span className="issueId">#{currentIssue.id}</span> {currentIssue.title}
                </h1>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {currentIssue.description}
              </p>
            </div>

            <div className="metadata">
              <div className="metadataItem">
                <span className="metadataLabel">Created</span>
                <span className="metadataValue">{formatDate(currentIssue.createdAt)}</span>
              </div>

              <div className="metadataItem">
                <span className="metadataLabel">Last Updated</span>
                <span className="metadataValue">{formatDate(currentIssue.updatedAt)}</span>
              </div>

              <div className="metadataItem">
                <span className="metadataLabel">Created By</span>
                <span className="metadataValue">{currentIssue.user?.email || 'Unknown'}</span>
              </div>
            </div>

            <div className="buttonGroup" style={{ marginTop: 'var(--spacing-xl)' }}>
              <div>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Issue
                </Button>
              </div>

              <div className="leftButtons">
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
              </div>
            </div>
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
    </div>
  );
};

export default IssueDetail;
