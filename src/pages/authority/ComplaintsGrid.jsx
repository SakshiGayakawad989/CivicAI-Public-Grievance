import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCivicData } from '../../context/CivicDataContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import { ManageComplaintModal } from '../../components/authority/ManageComplaintModal';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ArrowUpDown, 
  MapPin, 
  Calendar, 
  ExternalLink,
  Edit3,
  AlertTriangle,
  Download,
  CheckCircle2
} from 'lucide-react';

export function ComplaintsGrid() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialDept = searchParams.get('dept') || '';

  const { complaints } = useCivicData();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState(initialDept ? initialDept : 'ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST');

  // Modal State
  const [activeComplaintForManage, setActiveComplaintForManage] = useState(null);

  const filteredComplaints = useMemo(() => {
    let list = complaints.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        c.id.toString().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        (c.duplicateOf && c.duplicateOf.toString().includes(q));

      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
      const matchPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
      const matchDept = deptFilter === 'ALL' || c.department.toLowerCase().includes(deptFilter.toLowerCase());

      return matchSearch && matchStatus && matchCategory && matchPriority && matchDept;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortOrder === 'NEWEST') {
        return b.id - a.id;
      } else if (sortOrder === 'OLDEST') {
        return a.id - b.id;
      } else if (sortOrder === 'PRIORITY') {
        const pOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      return 0;
    });
  }, [complaints, searchQuery, statusFilter, categoryFilter, priorityFilter, deptFilter, sortOrder]);

  return (
    <div className="portal-page-container">
      {/* Page Title & Subtitle */}
      <div className="portal-page-header-row">
        <div>
          <h1 className="portal-page-title">Manage Complaints Data Grid</h1>
          <p className="portal-page-subtitle">
            Filter, inspect, reassign departments, and update grievance statuses
          </p>
        </div>
      </div>

      {/* FILTER BAR: Large rounded white card */}
      <div className="filter-bar-card card-box">
        <div className="filter-inputs-grid grid-five-col">
          {/* Search Box */}
          <div className="filter-search-box">
            <Search size={16} className="filter-search-icon" />
            <input 
              type="text" 
              placeholder="Search ID, title, or location..." 
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

          {/* Sort Dropdown */}
          <div className="filter-dropdown-wrap">
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="filter-select"
            >
              <option value="NEWEST">Sort: Newest First</option>
              <option value="OLDEST">Sort: Oldest First</option>
              <option value="PRIORITY">Sort: Priority High-to-Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* COMPLAINT TABLE: White rounded card */}
      <div className="complaint-table-card card-box">
        <div className="table-responsive-wrapper">
          <table className="civic-data-table authority-grid-table">
            <thead>
              <tr>
                <th style={{ width: '85px' }}>ID</th>
                <th>COMPLAINT</th>
                <th>CATEGORY</th>
                <th>PRIORITY</th>
                <th>DEPARTMENT</th>
                <th>LOCATION</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={9} className="table-empty-cell">
                    <div className="empty-state-box">
                      <AlertTriangle size={28} className="empty-state-icon" />
                      <h4>No Complaints Match Current Filters</h4>
                      <p>Clear or adjust your filter choices to view grievances.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id} className="table-data-row">
                    {/* ID & DUP OF #XX */}
                    <td className="cell-id">
                      <div className="id-number">#{c.id}</div>
                      {c.isDuplicate && (
                        <div className="dup-badge-under">
                          <span className="dup-sub-tag">DUP OF #{c.duplicateOf}</span>
                        </div>
                      )}
                    </td>

                    {/* Complaint Title */}
                    <td className="cell-title">
                      <Link 
                        to={`/citizen/complaints/${c.id}`} 
                        className="complaint-title-link"
                        title="View Full Resolution Lifecycle"
                      >
                        {c.title}
                      </Link>
                    </td>

                    {/* Category */}
                    <td>
                      <CategoryBadge category={c.category} size="small" />
                    </td>

                    {/* Priority */}
                    <td>
                      <PriorityBadge priority={c.priority} size="small" />
                    </td>

                    {/* Department */}
                    <td className="cell-dept">
                      {c.department}
                    </td>

                    {/* Location */}
                    <td className="cell-location-text" title={c.location}>
                      {c.location}
                    </td>

                    {/* Status */}
                    <td>
                      <StatusBadge status={c.status} size="small" />
                    </td>

                    {/* Date */}
                    <td className="cell-date">
                      {c.createdAt}
                    </td>

                    {/* Action: Manage */}
                    <td className="cell-action">
                      <button 
                        type="button" 
                        className="btn-manage-action"
                        onClick={() => setActiveComplaintForManage(c)}
                      >
                        <Edit3 size={13} />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Complaint Modal */}
      {activeComplaintForManage && (
        <ManageComplaintModal
          isOpen={!!activeComplaintForManage}
          onClose={() => setActiveComplaintForManage(null)}
          complaint={activeComplaintForManage}
        />
      )}
    </div>
  );
}
