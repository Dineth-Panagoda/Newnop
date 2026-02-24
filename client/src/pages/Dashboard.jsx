// ========================================
// DASHBOARD PAGE
// ========================================
// Main page showing issue statistics, list, search, filters, and pagination

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './Dashboard.css';
import {
  fetchIssues,
  fetchIssueStats,
  setFilters,
  clearFilters,
  setPage
} from '../redux/slices/issuesSlice';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux
  const { issues, pagination, filters, stats, loading, statsLoading } = useSelector(
    (state) => state.issues
  );

  // Local state for search input (to implement debouncing)
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Local state for success notification
  const [successNotification, setSuccessNotification] = useState('');
  const [isNotificationClosing, setIsNotificationClosing] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        dispatch(setFilters({ search: searchInput }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, dispatch]);

  // Fetch issues when filters or page changes
  useEffect(() => {
    dispatch(fetchIssues({
      page: pagination.currentPage,
      limit: pagination.limit,
      ...filters
    }));
  }, [dispatch, pagination.currentPage, pagination.limit, filters]);

  // Fetch statistics on mount
  useEffect(() => {
    dispatch(fetchIssueStats());
  }, [dispatch]);

  // Check for success notification from localStorage
  useEffect(() => {
    const message = localStorage.getItem('successMessage');
    if (message) {
      setSuccessNotification(message);
      localStorage.removeItem('successMessage');
    }
  }, []);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (successNotification) {
      // Start closing animation after 2.7 seconds
      const closeTimer = setTimeout(() => {
        setIsNotificationClosing(true);
      }, 2700);

      // Remove notification after animation completes (3 seconds total)
      const removeTimer = setTimeout(() => {
        setSuccessNotification('');
        setIsNotificationClosing(false);
      }, 3000);

      return () => {
        clearTimeout(closeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [successNotification]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFilters({ [name]: value }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchInput('');
    dispatch(clearFilters());
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to issue detail
  const handleIssueClick = (issueId) => {
    navigate(`/issues/${issueId}`);
  };

  // Navigate to create issue
  const handleCreateIssue = () => {
    navigate('/issues/create');
  };

  // Export issues to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Severity', 'Created At'];
    const rows = issues.map(issue => [
      issue.id,
      `"${issue.title}"`,
      `"${issue.description}"`,
      issue.status,
      issue.priority,
      issue.severity,
      new Date(issue.createdAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `issues-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Export issues to JSON
  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(issues, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `issues-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate result count text based on active filters
  const getResultCountText = () => {
    const count = pagination.totalCount;
    const issueWord = count === 1 ? 'Issue' : 'Issues';

    // Check if any filters are active
    const hasFilters = filters.status || filters.priority || filters.severity || filters.search;

    if (!hasFilters) {
      return `${count} Total ${issueWord}`;
    }

    // Build filter description
    let description = `${count} ${issueWord}`;
    let hasAddedFilter = false;

    if (filters.status) {
      description += ` in ${filters.status} status`;
      hasAddedFilter = true;
    }

    if (filters.priority) {
      description += hasAddedFilter ? ` with ${filters.priority} priority` : ` with ${filters.priority} priority`;
      hasAddedFilter = true;
    }

    if (filters.severity) {
      description += hasAddedFilter ? ` and ${filters.severity} severity` : ` with ${filters.severity} severity`;
    }

    return description;
  };

  return (
    <div className="container">
      {/* Success notification */}
      {successNotification && (
        <div className={`successNotification ${isNotificationClosing ? 'closing' : ''}`}>
          <div className="notificationIcon">✓</div>
          <span>{successNotification}</span>
        </div>
      )}

      {/* Header */}
      <div className="header">
        <h1 className="title">Dashboard</h1>
        <Button variant="primary" onClick={handleCreateIssue}>
          + Create Issue
        </Button>

        {/* Statistics Cards */}
        <div className="statsGrid">
          <Card className="statCard">
            <div className="statValue">
              {statsLoading ? '...' : stats.Open || 0}
            </div>
            <div className="statLabel">Open</div>
          </Card>

          <Card className="statCard">
            <div className="statValue">
              {statsLoading ? '...' : stats.InProgress || 0}
            </div>
            <div className="statLabel">In Progress</div>
          </Card>

          <Card className="statCard">
            <div className="statValue">
              {statsLoading ? '...' : stats.Resolved || 0}
            </div>
            <div className="statLabel">Resolved</div>
          </Card>

          <Card className="statCard">
            <div className="statValue">
              {statsLoading ? '...' : stats.Closed || 0}
            </div>
            <div className="statLabel">Closed</div>
          </Card>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filtersSection">
        <div className="filtersRow">
          {/* Search input with debouncing */}
          <Input
            placeholder="Search by title or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          {/* Status filter */}
          <Select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            options={['Open', 'InProgress', 'Resolved', 'Closed']}
            placeholder="All Statuses"
          />

          {/* Priority filter */}
          <Select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            options={['Low', 'Medium', 'High', 'Critical']}
            placeholder="All Priorities"
          />

          {/* Severity filter */}
          <Select
            name="severity"
            value={filters.severity}
            onChange={handleFilterChange}
            options={['Low', 'Medium', 'High', 'Critical']}
            placeholder="All Severities"
          />

          {/* Clear filters button - only show when filters are active */}
          {(searchInput || filters.status || filters.priority || filters.severity) && (
            <Button variant="ghost" onClick={handleClearFilters}>
              Clear
            </Button>
          )}
        </div>

        <div className="actionsRow">
          {/* Result count */}
          <div className="resultCount">
            {getResultCountText()}
          </div>

          {/* Export buttons */}
          <div className="exportButtons">
            <Button
              variant="outline"
              size="small"
              onClick={handleExportCSV}
              disabled={issues.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="small"
              onClick={handleExportJSON}
              disabled={issues.length === 0}
            >
              Export JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {loading ? (
        <Loader text="Loading issues..." />
      ) : issues.length === 0 ? (
        <div className="emptyState">
          <h3>No issues found</h3>
          <p>Try adjusting your filters or create a new issue</p>
        </div>
      ) : (
        <>
          <div className="issuesList">
            {issues.map((issue) => (
              <Card key={issue.id} className="issueCard" onClick={() => handleIssueClick(issue.id)}>
                <div className="issueHeader">
                  <h3 className="issueTitle">#{issue.id} - {issue.title}</h3>
                  <div className="issueBadges">
                    <Badge variant={issue.status}>{issue.status}</Badge>
                    <Badge variant={issue.priority}>{issue.priority}</Badge>
                  </div>
                </div>

                <p className="issueDescription">{issue.description}</p>

                <div className="issueFooter">
                  <span>Created {formatDate(issue.createdAt)}</span>
                  <span>Severity: {issue.severity}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <Button
                variant="ghost"
                size="small"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
              >
                ← Previous
              </Button>

              <span className="pageInfo">
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount} total issues)
              </span>

              <Button
                variant="ghost"
                size="small"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
