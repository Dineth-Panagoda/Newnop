// ========================================
// DASHBOARD PAGE
// ========================================
// Main page showing issue statistics, list, search, filters, and pagination

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
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

// ========================================
// STYLED COMPONENTS
// ========================================

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
`;

const Header = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const Title = styled.h1`
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
`;

const StatCard = styled(Card)`
  text-align: center;
  background: ${props => props.$bgColor || 'white'};
`;

const StatValue = styled.div`
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: ${props => props.$color || 'var(--gray-900)'};
`;

const StatLabel = styled.div`
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin-top: var(--spacing-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const FiltersSection = styled.div`
  margin-bottom: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const FiltersRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: var(--spacing-md);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

const ExportButtons = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const IssuesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const IssueCard = styled(Card)`
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const IssueHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
`;

const IssueTitle = styled.h3`
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  flex: 1;
`;

const IssueBadges = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
`;

const IssueDescription = styled.p`
  margin: var(--spacing-sm) 0;
  color: var(--gray-600);
  font-size: var(--text-sm);
  line-height: 1.5;

  /* Limit to 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const IssueFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--gray-200);
  font-size: var(--text-sm);
  color: var(--gray-500);
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
`;

const PageInfo = styled.span`
  font-size: var(--text-sm);
  color: var(--gray-600);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--gray-500);
`;

// ========================================
// DASHBOARD COMPONENT
// ========================================

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
  // This prevents API calls on every keystroke
  useEffect(() => {
    // Set a timer to update filters after user stops typing (500ms delay)
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        dispatch(setFilters({ search: searchInput }));
      }
    }, 500); // 500ms debounce delay

    // Clear timer if user types again before delay ends
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
    // Scroll to top when page changes
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
    // Create CSV content
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

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `issues-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Export issues to JSON
  const handleExportJSON = () => {
    // Create JSON content
    const jsonContent = JSON.stringify(issues, null, 2);

    // Create and download file
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
    <Container>
      {/* Header */}
      <Header>
        <Title>Issue Tracker Dashboard</Title>

        {/* Statistics Cards */}
        <StatsGrid>
          <StatCard $bgColor="#e0e7ff">
            <StatValue $color="#4f46e5">
              {statsLoading ? '...' : stats.Open || 0}
            </StatValue>
            <StatLabel>Open</StatLabel>
          </StatCard>

          <StatCard $bgColor="#fef3c7">
            <StatValue $color="#d97706">
              {statsLoading ? '...' : stats.InProgress || 0}
            </StatValue>
            <StatLabel>In Progress</StatLabel>
          </StatCard>

          <StatCard $bgColor="#d1fae5">
            <StatValue $color="#059669">
              {statsLoading ? '...' : stats.Resolved || 0}
            </StatValue>
            <StatLabel>Resolved</StatLabel>
          </StatCard>

          <StatCard $bgColor="#e5e7eb">
            <StatValue $color="#6b7280">
              {statsLoading ? '...' : stats.Closed || 0}
            </StatValue>
            <StatLabel>Closed</StatLabel>
          </StatCard>
        </StatsGrid>
      </Header>

      {/* Filters and Search */}
      <FiltersSection>
        <FiltersRow>
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
        </FiltersRow>

        <ActionsRow>
          <Button variant="primary" onClick={handleCreateIssue}>
            + Create Issue
          </Button>

          {/* Export buttons */}
          <ExportButtons>
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
          </ExportButtons>
        </ActionsRow>
      </FiltersSection>

      {/* Issues List */}
      {loading ? (
        <Loader text="Loading issues..." />
      ) : issues.length === 0 ? (
        <EmptyState>
          <h3>No issues found</h3>
          <p>Try adjusting your filters or create a new issue</p>
        </EmptyState>
      ) : (
        <>
          <IssuesList>
            {issues.map((issue) => (
              <IssueCard key={issue.id} onClick={() => handleIssueClick(issue.id)}>
                <IssueHeader>
                  <IssueTitle>#{issue.id} - {issue.title}</IssueTitle>
                  <IssueBadges>
                    <Badge variant={issue.status}>{issue.status}</Badge>
                    <Badge variant={issue.priority}>{issue.priority}</Badge>
                  </IssueBadges>
                </IssueHeader>

                <IssueDescription>{issue.description}</IssueDescription>

                <IssueFooter>
                  <span>Created {formatDate(issue.createdAt)}</span>
                  <span>Severity: {issue.severity}</span>
                </IssueFooter>
              </IssueCard>
            ))}
          </IssuesList>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination>
              <Button
                variant="ghost"
                size="small"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
              >
                ← Previous
              </Button>

              <PageInfo>
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount} total issues)
              </PageInfo>

              <Button
                variant="ghost"
                size="small"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next →
              </Button>
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default Dashboard;
