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
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';

// Custom hook for count-up animation
const useCountUp = (end, duration = 1000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Ease-out function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    if (end > 0) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      setCount(0);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return count;
};

// StatCard component with count-up animation
const StatCard = ({ value, label, isLoading }) => {
  const animatedValue = useCountUp(value);

  return (
    <Card className="statCard">
      <div className="statValue">
        {isLoading ? '...' : animatedValue}
      </div>
      <div className="statLabel">{label}</div>
    </Card>
  );
};

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
  const handleExportCSV = async () => {
    try {
      // Fetch all issues matching current filters
      const result = await dispatch(fetchIssues({
        page: 1,
        limit: 10000,
        ...filters
      })).unwrap();

      const allIssues = result.issues || [];

      const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Severity', 'Created At'];
      const rows = allIssues.map(issue => [
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
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };

  // Export issues to JSON
  const handleExportJSON = async () => {
    try {
      // Fetch all issues matching current filters
      const result = await dispatch(fetchIssues({
        page: 1,
        limit: 10000,
        ...filters
      })).unwrap();

      const allIssues = result.issues || [];

      const jsonContent = JSON.stringify(allIssues, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `issues-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (error) {
      console.error('Failed to export JSON:', error);
    }
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

  // Escape special regex characters
  const escapeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Highlight search term in text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) {
      return text;
    }

    try {
      const escapedTerm = escapeRegex(searchTerm.trim());
      const regex = new RegExp(`(${escapedTerm})`, 'gi');
      const parts = text.split(regex);

      return parts.map((part, index) => {
        if (regex.test(part)) {
          // Reset regex lastIndex for next test
          regex.lastIndex = 0;
          return <mark key={index}>{part}</mark>;
        }
        return part;
      });
    } catch (error) {
      // If regex fails, return original text
      return text;
    }
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

    // Add search query if present
    if (filters.search) {
      description += ` for "${filters.search}"`;
      hasAddedFilter = true;
    }

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
          <StatCard
            value={stats.Open || 0}
            label="Open"
            isLoading={statsLoading}
          />
          <StatCard
            value={stats.InProgress || 0}
            label="In Progress"
            isLoading={statsLoading}
          />
          <StatCard
            value={stats.Resolved || 0}
            label="Resolved"
            isLoading={statsLoading}
          />
          <StatCard
            value={stats.Closed || 0}
            label="Closed"
            isLoading={statsLoading}
          />
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filtersSection">
        <div className="filtersRow">
          <div className="filterFields">
            {/* Search input with debouncing */}
            <Input
              placeholder="Search by title or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              showFilledState={true}
            />

            {/* Status filter */}
            <Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              options={['Open', 'InProgress', 'Resolved', 'Closed']}
              placeholder="All Statuses"
              showFilledState={true}
            />

            {/* Priority filter */}
            <Select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              options={['Low', 'Medium', 'High', 'Critical']}
              placeholder="All Priorities"
              showFilledState={true}
            />

            {/* Severity filter */}
            <Select
              name="severity"
              value={filters.severity}
              onChange={handleFilterChange}
              options={['Low', 'Medium', 'High', 'Critical']}
              placeholder="All Severities"
              showFilledState={true}
            />
          </div>

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

          {/* Export menu */}
          <div className="exportMenu">
            <Button
              variant="outline"
              size="small"
              disabled={issues.length === 0}
            >
              <IosShareRoundedIcon style={{ fontSize:'20px'}}/>
              Export List
            </Button>
            <div className="exportDropdown">
              <button onClick={handleExportCSV} className="exportOption">
                Export as CSV
              </button>
              <button onClick={handleExportJSON} className="exportOption">
                Export as JSON
              </button>
            </div>
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
                <div className="issueContent">
                  <div className="issueLeft">
                    <h3 className="issueTitle">
                      #{issue.id} - {highlightText(issue.title, filters.search)}
                    </h3>
                    <p className="issueDescription">
                      {highlightText(issue.description, filters.search)}
                    </p>
                    <div className="issueFooter">
                      <span>Created {formatDate(issue.createdAt)}</span>
                    </div>
                  </div>

                  <div className="issueRight">
                    <div className="issueBadges">
                      <div className="badgeGroup">
                        <span className="badgeLabel">Status:</span>
                        <Badge variant={issue.status}>{issue.status}</Badge>
                      </div>
                      <div className="badgeGroup">
                        <span className="badgeLabel">Priority:</span>
                        <Badge variant={issue.priority}>{issue.priority}</Badge>
                      </div>
                      <div className="badgeGroup">
                        <span className="badgeLabel">Severity:</span>
                        <Badge variant={issue.severity}>{issue.severity}</Badge>
                      </div>
                    </div>
                  </div>
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
                    <span> Page {pagination.currentPage} of {pagination.totalPages}</span>
                    <span> ({(pagination.currentPage - 1) * pagination.limit + 1}-{Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount}) </span>
                    
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
