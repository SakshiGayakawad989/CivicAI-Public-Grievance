
import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useCivicData } from '../../context/CivicDataContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import {
  Search,
  PlusCircle,
  ArrowRight,
  MapPin,
  AlertCircle
} from 'lucide-react';

export function MyComplaints() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { complaints = [], normalizeComplaintCategory } = useCivicData();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Fallback in case the context normalizer is unavailable.
  const normalizeCategory = (category) => {
    if (typeof normalizeComplaintCategory === 'function') {
      return normalizeComplaintCategory(category);
    }

    const value = String(
      typeof category === 'object' && category !== null
        ? category.name ?? category.category ?? category.value ?? ''
        : category ?? ''
    )
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

    const aliases = {
      ROAD: 'ROADS',
      ROADS: 'ROADS',
      WATERLEAK: 'WATER',
      WATERLEAKAGE: 'WATER',
      WATERSUPPLY: 'WATER',
      WATER: 'WATER',
      ELECTRICAL: 'ELECTRICITY',
      ELECTRICITY: 'ELECTRICITY',
      DRAIN: 'DRAINAGE',
      DRAINAGE: 'DRAINAGE',
      WASTE: 'GARBAGE',
      WASTEMANAGEMENT: 'GARBAGE',
      GARBAGE: 'GARBAGE',
      STREETLIGHTS: 'STREETLIGHT',
      STREETLIGHT: 'STREETLIGHT',
      SANITATION: 'SANITATION',
      OTHER: 'OTHER'
    };

    return aliases[value] || value;
  };

  const filteredComplaints = useMemo(() => {
    const safeComplaints = Array.isArray(complaints) ? complaints : [];

    return safeComplaints.filter((c) => {
      const q = searchQuery.toLowerCase().trim();

      // Safely handle values that may be objects or missing.
      const getText = (value) => {
        if (value && typeof value === 'object') {
          return String(
            value.name ?? value.title ?? value.label ?? value.value ?? ''
          );
        }
        return String(value ?? '');
      };

      const id = getText(c.id);
      const title = getText(c.title);
      const location = getText(c.location);
      const category = getText(c.category);
      const department = getText(c.department);
      const status = getText(c.status).toUpperCase().replace(/_/g, ' ');
      const priority = getText(c.priority).toUpperCase();

      const matchSearch =
        !q ||
        id.toLowerCase().includes(q) ||
        title.toLowerCase().includes(q) ||
        location.toLowerCase().includes(q) ||
        category.toLowerCase().includes(q) ||
        department.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'ALL' ||
        status === statusFilter.toUpperCase().replace(/_/g, ' ');

      const matchCategory =
        categoryFilter === 'ALL' ||
        normalizeCategory(c.category) ===
          normalizeCategory(categoryFilter);

      const matchPriority =
        priorityFilter === 'ALL' ||
        priority === priorityFilter.toUpperCase();

      return (
        matchSearch &&
        matchStatus &&
        matchCategory &&
        matchPriority
      );
    });
  }, [
    complaints,
    searchQuery,
    statusFilter,
    categoryFilter,
    priorityFilter,
    normalizeComplaintCategory
  ]);

  return (
    <div className="portal-page-container">
      {/* Top Header Card */}
      <div className="portal-page-header-row">
        <div>
          <h1 className="portal-page-title">My Grievance Reports</h1>
          <p className="portal-page-subtitle">
            Filter, search, and track resolution lifecycle of submitted civic issues
          </p>
        </div>

        <div>
          <button
            type="button"
            className="btn-primary-action"
            onClick={() => navigate('/citizen/submit')}
          >
            <PlusCircle size={16} />
            <span>Report New Issue</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar-card card-box">
        <div className="filter-inputs-grid">
          {/* Search Box */}
          <div className="filter-search-box">
            <Search size={16} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search by ID, keyword, or spot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input-text"
            />
          </div>

          {/* Status Dropdown */}
          <div className="filter-dropdown-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div className="filter-dropdown-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Categories</option>
              <option value="ELECTRICITY">Electricity</option>
              <option value="ROAD">Road</option>
              <option value="SANITATION">Sanitation</option>
              <option value="WATER">Water</option>
              <option value="DRAINAGE">Drainage</option>
              <option value="GARBAGE">Garbage</option>
              <option value="STREETLIGHT">Streetlight</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Priority Dropdown */}
          <div className="filter-dropdown-wrap">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table Card */}
      <div className="complaint-table-card card-box">
        <div className="table-responsive-wrapper">
          <table className="civic-data-table">
            <thead>
              <tr>
                <th style={{ width: '85px' }}>ID</th>
                <th>TITLE &amp; LOCATION</th>
                <th>CATEGORY</th>
                <th>PRIORITY</th>
                <th>DEPARTMENT</th>
                <th>STATUS</th>
                <th>CREATED DATE</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-empty-cell">
                    <div className="empty-state-box">
                      <AlertCircle
                        size={28}
                        className="empty-state-icon"
                      />
                      <h4>No Grievance Reports Found</h4>
                      <p>
                        Try adjusting your search query or filter criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id} className="table-data-row">
                    {/* ID & Duplicate Tag */}
                    <td className="cell-id">
                      <div className="id-number">#{c.id}</div>

                      {c.isDuplicate && (
                        <span className="dup-sub-tag">
                          DUP OF #{c.duplicateOf}
                        </span>
                      )}
                    </td>

                    {/* Title & Location */}
                    <td className="cell-title-loc">
                      <div className="complaint-row-title">
                        {c.title || 'Untitled complaint'}
                      </div>

                      <div className="complaint-row-location">
                        <MapPin
                          size={12}
                          className="loc-pin-inline"
                        />
                        <span>{c.location || 'Location not specified'}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <CategoryBadge
                        category={c.category}
                        size="small"
                      />
                    </td>

                    {/* Priority */}
                    <td>
                      <PriorityBadge
                        priority={c.priority}
                        size="small"
                      />
                    </td>

                    {/* Department */}
                    <td className="cell-dept">
                      {typeof c.department === 'object'
                        ? c.department?.name || 'Not assigned'
                        : c.department || 'Not assigned'}
                    </td>

                    {/* Status */}
                    <td>
                      <StatusBadge
                        status={c.status}
                        size="small"
                      />
                    </td>

                    {/* Created Date */}
                    <td className="cell-date">
                      {c.createdAt || '—'}
                    </td>

                    {/* Action */}
                    <td className="cell-action">
                      <Link
                        to={`/citizen/complaints/${c.id}`}
                        className="btn-table-action"
                      >
                        <span>Details</span>
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
