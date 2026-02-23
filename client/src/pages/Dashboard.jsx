// ========================================
// DASHBOARD PAGE
// ========================================
// Main page showing issue statistics, list, search, filters, and pagination

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Dashboard.module.css';
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

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Issue Tracker Dashboard</h1>

        {/* Statistics Cards */}
        <div className={styles.statsGrid}>
          <Card className={styles.statCard} style={{ background: '#e0e7ff' }}>
            <div className={styles.statValue} style={{ color: '#4f46e5' }}>
              {statsLoading ? '...' : stats.Open || 0}
            </div>
            <div className={styles.statLabel}>Open</div>
          </Card>

          <Card className={styles.statCard} style={{ background: '#fef3c7' }}>
            <div className={styles.statValue} style={{ color: '#d97706' }}>
              {statsLoading ? '...' : stats.InProgress || 0}
            </div>
            <div className={styles.statLabel}>In Progress</div>
          </Card>

          <Card className={styles.statCard} style={{ background: '#d1fae5' }}>
            <div className={styles.statValue} style={{ color: '#059669' }}>
              {statsLoading ? '...' : stats.Resolved || 0}
            </div>
            <div className={styles.statLabel}>Resolved</div>
          </Card>

          <Card className={styles.statCard} style={{ background: '#e5e7eb' }}>
            <div className={styles.statValue} style={{ color: '#6b7280' }}>
              {statsLoading ? '...' : stats.Closed || 0}
            </div>
            <div className={styles.statLabel}>Closed</div>
          </Card>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersSection}>
        <div className={styles.filtersRow}>
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

          {/* Clear filters button */}
          <Button variant="ghost" onClick={handleClearFilters}>
            Clear
          </Button>
        </div>

        <div className={styles.actionsRow}>
          <Button variant="primary" onClick={handleCreateIssue}>
            + Create Issue
          </Button>

          {/* Export buttons */}
          <div className={styles.exportButtons}>
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
        <div className={styles.emptyState}>
          <h3>No issues found</h3>
          <p>Try adjusting your filters or create a new issue</p>
        </div>
      ) : (
        <>
          <div className={styles.issuesList}>
            {issues.map((issue) => (
              <Card key={issue.id} className={styles.issueCard} onClick={() => handleIssueClick(issue.id)}>
                <div className={styles.issueHeader}>
                  <h3 className={styles.issueTitle}>#{issue.id} - {issue.title}</h3>
                  <div className={styles.issueBadges}>
                    <Badge variant={issue.status}>{issue.status}</Badge>
                    <Badge variant={issue.priority}>{issue.priority}</Badge>
                  </div>
                </div>

                <p className={styles.issueDescription}>{issue.description}</p>

                <div className={styles.issueFooter}>
                  <span>Created {formatDate(issue.createdAt)}</span>
                  <span>Severity: {issue.severity}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <Button
                variant="ghost"
                size="small"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
              >
                ← Previous
              </Button>

              <span className={styles.pageInfo}>
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
