
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCivicData } from '../../context/CivicDataContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import { Timeline } from '../../components/citizen/Timeline';
import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Building2,
  Calendar,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  MessageSquareHeart
} from 'lucide-react';

const BACKEND_BASE_URL = 'http://localhost:8080';

const getImageUrl = (imagePath) => {
  if (typeof imagePath !== 'string' || !imagePath.trim()) {
    return null;
  }

  const path = imagePath.trim();

  if (
    path.toLowerCase() === 'null' ||
    path.toLowerCase() === 'undefined'
  ) {
    return null;
  }

  // Keep a complete URL if the backend already provides one.
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Convert a relative backend image path into a complete URL.
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${BACKEND_BASE_URL}${normalizedPath}`;
};

export function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getComplaintById, role } = useCivicData();

  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  // Do not show another complaint when the requested ID is not found.
  const complaint = getComplaintById(id);

  if (!complaint) {
    return (
      <div className="portal-page-container">
        <div
          className="card-box"
          style={{ padding: '3rem', textAlign: 'center' }}
        >
          <h2>Complaint #{id} Not Found</h2>

          <p style={{ color: '#64748B', marginTop: '0.5rem' }}>
            The requested grievance ticket could not be located in the
            municipal database.
          </p>

          <button
            type="button"
            className="btn-cancel-back"
            style={{ marginTop: '1.5rem', display: 'inline-flex' }}
            onClick={() => navigate('/citizen/complaints')}
          >
            <ArrowLeft size={16} />
            <span>Return to Complaints</span>
          </button>
        </div>
      </div>
    );
  }

  // Support both the frontend photoUrl property and backend imagePath property.
  const complaintImageUrl = getImageUrl(
    complaint.imagePath || complaint.photoUrl
  );

  const hasComplaintImage = Boolean(
    complaintImageUrl && !imageLoadFailed
  );

  return (
    <div className="portal-page-container">
      {/* Top Back Navigation Bar */}
      <div className="details-top-bar">
        <Link
          to={
            role === 'authority'
              ? '/authority/complaints'
              : '/citizen/complaints'
          }
          className="back-nav-link"
        >
          <ArrowLeft size={16} />
          <span>
            {role === 'authority'
              ? 'Back to All Complaints'
              : 'Back to My Complaints'}
          </span>
        </Link>

        <div className="ticket-id-tag">
          TICKET #{complaint.id}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="details-two-column-grid">
        {/* LEFT COLUMN: Main Complaint Info */}
        <div className="details-left-card card-box">
          {/* Header Metadata & Badges */}
          <div className="details-header-row">
            <div className="details-badges-group">
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              <CategoryBadge category={complaint.category} />
            </div>

            <div className="details-date-stamp">
              <Calendar size={14} />
              <span>{complaint.createdAt}</span>
            </div>
          </div>

          <h1 className="details-title">
            {complaint.title}
          </h1>

          {/* Duplicate Alert Card */}
          {complaint.isDuplicate && (
            <div className="duplicate-alert-banner">
              <div className="dup-alert-icon">
                <AlertTriangle size={20} />
              </div>

              <div className="dup-alert-content">
                <h4 className="dup-alert-heading">
                  Duplicate Grievance Flagged by AI
                </h4>

                <p className="dup-alert-text">
                  This complaint was automatically recognized as
                  duplicate of master ticket #
                  {complaint.duplicateOf || 11}. Actions and squad
                  dispatches are synchronized.
                </p>
              </div>

              {complaint.duplicateOf && (
                <Link
                  to={
                    role === 'authority'
                      ? `/authority/complaints?q=${complaint.duplicateOf}`
                      : `/citizen/complaints/${complaint.duplicateOf}`
                  }
                  className="dup-view-master-btn"
                >
                  <span>
                    Master #{complaint.duplicateOf}
                  </span>
                  <ExternalLink size={13} />
                </Link>
              )}
            </div>
          )}

          {/* Photo Evidence: Render only when an image exists */}
          {hasComplaintImage && (
            <div className="details-section-block">
              <div className="section-block-title">
                PHOTO EVIDENCE
              </div>

              <div className="details-photo-wrapper">
                <img
                  src={complaintImageUrl}
                  alt="Complaint evidence"
                  className="details-photo-img"
                  onError={() => setImageLoadFailed(true)}
                />

                <div className="photo-verified-badge">
                  <ShieldCheck size={14} />
                  <span>Uploaded Photo</span>
                </div>
              </div>
            </div>
          )}

          {/* Issue Description Section */}
          <div className="details-section-block">
            <div className="section-block-title">
              ISSUE DESCRIPTION
            </div>

            <p className="details-description-text">
              {complaint.description}
            </p>
          </div>

          {/* Detail Information */}
          <div className="details-section-block">
            <div className="section-block-title">
              DETAIL INFORMATION
            </div>

            <div className="detail-meta-grid">
              <div className="meta-field-card">
                <div className="meta-field-label">
                  <MapPin size={15} className="meta-icon" />
                  <span>Location Address</span>
                </div>

                <div className="meta-field-value">
                  {complaint.location}
                </div>

                <div className="meta-field-sub">
                  Coordinates:{' '}
                  {complaint.coordinates?.lat ?? 16.1825}° N,{' '}
                  {complaint.coordinates?.lng ?? 75.6938}° E
                </div>
              </div>

              <div className="meta-field-card">
                <div className="meta-field-label">
                  <Building2 size={15} className="meta-icon" />
                  <span>Assigned Department</span>
                </div>

                <div className="meta-field-value">
                  {complaint.department}
                </div>

                <div className="meta-field-sub">
                  SLA Response Target: 24 - 48 Hours
                </div>
              </div>
            </div>
          </div>

          {/* Citizen Feedback Link */}
          <div className="details-action-footer">
            <Link
              to={`/citizen/feedback/${complaint.id}`}
              className="details-feedback-btn"
            >
              <MessageSquareHeart size={16} />
              <span>
                {complaint.feedback
                  ? 'View / Update Feedback'
                  : 'Submit Resolution Feedback'}
              </span>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Resolution Timeline & AI Scores */}
        <div className="details-right-column">
          {/* Resolution Lifecycle Timeline */}
          <Timeline timeline={complaint.timeline || []} />

          {/* AI Classification Score Card */}
          <div className="ai-score-card">
            <div className="ai-score-header">
              <div className="ai-score-title-row">
                <Sparkles
                  size={18}
                  className="ai-score-sparkle"
                />
                <h3 className="ai-score-heading">
                  AI Classification Score
                </h3>
              </div>

              <span className="ai-score-engine-pill">
                CivicBERT v3
              </span>
            </div>

            <div className="ai-score-metrics-grid">
              <div className="score-metric-box">
                <div className="score-metric-label">
                  Category Accuracy
                </div>

                <div className="score-metric-val">
                  {complaint.aiScores?.categoryAccuracy ?? 95}%
                </div>

                <div className="score-progress-track">
                  <div
                    className="score-progress-fill"
                    style={{
                      width: `${complaint.aiScores?.categoryAccuracy ?? 95}%`
                    }}
                  />
                </div>
              </div>

              <div className="score-metric-box">
                <div className="score-metric-label">
                  Priority Score
                </div>

                <div className="score-metric-val">
                  {complaint.aiScores?.priorityScore ?? 94}%
                </div>

                <div className="score-progress-track">
                  <div
                    className="score-progress-fill fill-amber"
                    style={{
                      width: `${complaint.aiScores?.priorityScore ?? 94}%`
                    }}
                  />
                </div>
              </div>

              <div className="score-metric-box">
                <div className="score-metric-label">
                  Dept Match
                </div>

                <div className="score-metric-val">
                  {complaint.aiScores?.deptMatch ?? 97}%
                </div>

                <div className="score-progress-track">
                  <div
                    className="score-progress-fill fill-green"
                    style={{
                      width: `${complaint.aiScores?.deptMatch ?? 97}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
