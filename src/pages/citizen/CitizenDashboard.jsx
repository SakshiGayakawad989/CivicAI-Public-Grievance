import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCivicData } from '../../context/CivicDataContext';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import { 
  PlusCircle, 
  FileText, 
  MessageSquareHeart, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  MapPin,
  TrendingUp
} from 'lucide-react';

export function CitizenDashboard() {
  const navigate = useNavigate();
  const { complaints, users } = useCivicData();
  const citizen = users.citizen;

  const total = complaints.length;
  const submitted = complaints.filter(c => c.status === 'SUBMITTED').length;
  const inProgress = complaints.filter(c => c.status === 'IN PROGRESS').length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED').length;

  const recentComplaints = complaints.slice(0, 4);

  return (
    <div className="portal-page-container">
      {/* Welcome Banner Card */}
      <div className="citizen-welcome-card card-box">
        <div className="welcome-left">
          <div className="welcome-tag">
            <ShieldCheck size={14} />
            <span>VERIFIED CITIZEN PORTAL</span>
          </div>
          <h1 className="welcome-heading">Welcome back, {citizen.name}</h1>
          <p className="welcome-subtext">
            Track your civic reports in real-time across Bagalkot Ward 8 and monitor automated municipal squad resolution.
          </p>
        </div>
        <div className="welcome-quick-actions">
          <button 
            type="button" 
            className="btn-primary-action"
            onClick={() => navigate('/citizen/submit')}
          >
            <PlusCircle size={17} />
            <span>Report a Complaint</span>
          </button>
        </div>
      </div>

      {/* Quick Statistics Row */}
      <div className="metrics-grid-four">
        <MetricCard 
          icon={FileText}
          title="Total Reports"
          value={total}
          subtitle="All filed civic tickets"
          accentColor="#1677F0"
          iconBg="rgba(22, 119, 240, 0.1)"
        />

        <MetricCard 
          icon={Clock}
          title="Submitted"
          value={submitted}
          subtitle="Awaiting squad dispatch"
          accentColor="#0284C7"
          iconBg="rgba(2, 132, 199, 0.1)"
        />

        <MetricCard 
          icon={TrendingUp}
          title="In Progress"
          value={inProgress}
          subtitle="Active field work"
          accentColor="#D97706"
          iconBg="rgba(217, 119, 6, 0.1)"
        />

        <MetricCard 
          icon={CheckCircle2}
          title="Resolved"
          value={resolved}
          subtitle="Successfully fixed"
          accentColor="#16A34A"
          iconBg="rgba(22, 163, 74, 0.1)"
        />
      </div>

      {/* Two Column Section: Recent Reports & AI Insights */}
      <div className="dashboard-split-grid">
        {/* Left: Recent Complaints */}
        <div className="dashboard-section-card card-box">
          <div className="section-header-flex">
            <div>
              <h3 className="section-title">Recent Grievance Reports</h3>
              <p className="section-subtitle">Latest status of your civic tickets</p>
            </div>
            <Link to="/citizen/complaints" className="section-view-all-link">
              <span>View All ({total})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="recent-list-container">
            {recentComplaints.map((c) => (
              <div key={c.id} className="recent-complaint-item">
                <div className="recent-item-left">
                  <div className="recent-id-badge">#{c.id}</div>
                  <div className="recent-item-info">
                    <h4 className="recent-item-title">{c.title}</h4>
                    <div className="recent-item-meta">
                      <span className="recent-location">
                        <MapPin size={12} />
                        {c.location}
                      </span>
                      <span className="meta-dot">•</span>
                      <span className="recent-date">{c.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="recent-item-right">
                  <CategoryBadge category={c.category} size="small" />
                  <StatusBadge status={c.status} size="small" />
                  <Link to={`/citizen/complaints/${c.id}`} className="btn-table-action-sm">
                    <span>Track</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Insights & Quick Action Shortcuts */}
        <div className="dashboard-right-sidebar">
          {/* AI Insights Card */}
          <div className="ai-insight-card card-box">
            <div className="ai-insight-header">
              <Sparkles size={18} className="ai-sparkle-icon" />
              <h4>Civic AI Ward Insights</h4>
            </div>
            <p className="ai-insight-body">
              <strong>Smart Deduplication Active:</strong> Grievance #18 (broken streetlight) was automatically grouped with master ticket #11 to streamline electrical squad repairs along College Road.
            </p>
            <div className="ai-insight-footer">
              <span className="ai-metric-pill">95% NLP Confidence</span>
              <span className="ai-metric-pill">0.2s Inference</span>
            </div>
          </div>

          {/* Quick Action Hub */}
          <div className="quick-actions-card card-box">
            <h4 className="quick-actions-title">Portal Shortcuts</h4>
            <div className="shortcuts-list">
              <button 
                type="button" 
                className="shortcut-btn"
                onClick={() => navigate('/citizen/submit')}
              >
                <div className="shortcut-icon-wrap bg-blue-tint">
                  <PlusCircle size={18} />
                </div>
                <div className="shortcut-text">
                  <span className="shortcut-name">Report Civic Issue</span>
                  <span className="shortcut-desc">Upload photo & GPS location</span>
                </div>
              </button>

              <button 
                type="button" 
                className="shortcut-btn"
                onClick={() => navigate('/citizen/complaints')}
              >
                <div className="shortcut-icon-wrap bg-teal-tint">
                  <FileText size={18} />
                </div>
                <div className="shortcut-text">
                  <span className="shortcut-name">Track Complaints</span>
                  <span className="shortcut-desc">Inspect live resolution lifecycles</span>
                </div>
              </button>

              <button 
                type="button" 
                className="shortcut-btn"
                onClick={() => navigate('/citizen/feedback/18')}
              >
                <div className="shortcut-icon-wrap bg-amber-tint">
                  <MessageSquareHeart size={18} />
                </div>
                <div className="shortcut-text">
                  <span className="shortcut-name">Give Feedback</span>
                  <span className="shortcut-desc">Rate completed squad repairs</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
