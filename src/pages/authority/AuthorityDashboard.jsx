import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCivicData } from '../../context/CivicDataContext';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { CategoryBadge } from '../../components/common/CategoryBadge';
import { ManageComplaintModal } from '../../components/authority/ManageComplaintModal';
import { 
  FileText, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  Flame, 
  Building2, 
  BrainCircuit, 
  Sparkles, 
  Star, 
  ArrowRight,
  Shield,
  Activity,
  Edit3
} from 'lucide-react';

export function AuthorityDashboard() {
  const navigate = useNavigate();
  const { complaints, departments, hotspots, feedbackList, users } = useCivicData();
  const officer = users.authority;

  const [manageComplaint, setManageComplaint] = useState(null);

  const total = complaints.length;
  const submitted = complaints.filter(c => c.status === 'SUBMITTED').length;
  const inProgress = complaints.filter(c => c.status === 'IN PROGRESS').length;
  const resolved = complaints.filter(c => c.status === 'RESOLVED').length;

  return (
    <div className="portal-page-container">
      {/* Officer Welcome Header Banner */}
      <div className="authority-welcome-card card-box">
        <div className="welcome-left">
          <div className="officer-badge">
            <Shield size={14} />
            <span>MUNICIPAL COMMAND CENTER — BAGALKOT CMC</span>
          </div>
          <h1 className="welcome-heading">Welcome, {officer.name}</h1>
          <p className="welcome-subtext">
            {officer.title} • {officer.department} • Active Zone: {officer.zone}
          </p>
        </div>
        <div className="welcome-quick-actions">
          <button 
            type="button" 
            className="btn-detect-hotspots"
            onClick={() => navigate('/authority/hotspots')}
          >
            <Flame size={16} />
            <span>Inspect Hotspots ({hotspots.length})</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="metrics-grid-four">
        <MetricCard 
          icon={FileText}
          title="Total Complaints"
          value={total}
          subtitle="Active municipal intake"
          trend={{ positive: true, text: "12% this week" }}
          accentColor="#1677F0"
          iconBg="rgba(22, 119, 240, 0.1)"
        />

        <MetricCard 
          icon={Clock}
          title="Submitted"
          value={submitted}
          subtitle="Pending department triage"
          accentColor="#0284C7"
          iconBg="rgba(2, 132, 199, 0.1)"
        />

        <MetricCard 
          icon={TrendingUp}
          title="In Progress"
          value={inProgress}
          subtitle="Field squad deployed"
          accentColor="#D97706"
          iconBg="rgba(217, 119, 6, 0.1)"
        />

        <MetricCard 
          icon={CheckCircle2}
          title="Resolved"
          value={resolved}
          subtitle="Verified resolution"
          trend={{ positive: true, text: "94.2% SLA met" }}
          accentColor="#16A34A"
          iconBg="rgba(22, 163, 74, 0.1)"
        />
      </div>

      {/* Middle Row: Department SLA Snapshot & AI Engine Performance */}
      <div className="dashboard-split-grid">
        {/* Department SLA Snapshot */}
        <div className="dashboard-section-card card-box">
          <div className="section-header-flex">
            <div>
              <h3 className="section-title">Department SLA & Workload</h3>
              <p className="section-subtitle">Real-time compliance monitoring across squads</p>
            </div>
            <Link to="/authority/departments" className="section-view-all-link">
              <span>View All ({departments.length})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="dept-summary-list">
            {departments.map((d) => (
              <div key={d.id} className="dept-summary-item">
                <div className="dept-summary-left">
                  <span className="dept-summary-name">{d.name}</span>
                  <span className="dept-summary-head">{d.head}</span>
                </div>
                <div className="dept-summary-mid">
                  <div className="dept-summary-prog-track">
                    <div 
                      className="dept-summary-prog-fill" 
                      style={{ width: `${d.sla}%` }}
                    />
                  </div>
                  <span className="dept-summary-sla-text">SLA: {d.sla}%</span>
                </div>
                <div className="dept-summary-right">
                  <span className="dept-ticket-count">{d.resolved} / {d.total} Fixed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Classification & Hotspot Engine Status */}
        <div className="dashboard-section-card card-box">
          <div className="section-header-flex">
            <div>
              <h3 className="section-title">AI Intelligence Core</h3>
              <p className="section-subtitle">Zero-latency NLP & Spatial DBSCAN</p>
            </div>
            <Link to="/authority/analytics" className="section-view-all-link">
              <span>Deep Analytics</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="ai-core-metrics-grid">
            <div className="ai-core-stat-box">
              <div className="core-stat-top">
                <BrainCircuit size={18} className="core-stat-icon text-cyan" />
                <span className="core-stat-label">Classification Accuracy</span>
              </div>
              <div className="core-stat-val">95.8%</div>
              <div className="core-stat-sub">Zero manual tagging errors</div>
            </div>

            <div className="ai-core-stat-box">
              <div className="core-stat-top">
                <Sparkles size={18} className="core-stat-icon text-amber" />
                <span className="core-stat-label">Deduplication Savings</span>
              </div>
              <div className="core-stat-val">340 Hrs</div>
              <div className="core-stat-sub">Redundant trips eliminated</div>
            </div>

            <div className="ai-core-stat-box">
              <div className="core-stat-top">
                <Flame size={18} className="core-stat-icon text-red" />
                <span className="core-stat-label">Active Hotspots</span>
              </div>
              <div className="core-stat-val">{hotspots.length} Zones</div>
              <div className="core-stat-sub">High density cluster warnings</div>
            </div>

            <div className="ai-core-stat-box">
              <div className="core-stat-top">
                <Star size={18} className="core-stat-icon text-gold" />
                <span className="core-stat-label">Citizen Satisfaction</span>
              </div>
              <div className="core-stat-val">4.5 / 5.0</div>
              <div className="core-stat-sub">Verified resident feedback</div>
            </div>
          </div>

          <div className="hotspot-banner-mini" onClick={() => navigate('/authority/hotspots')}>
            <Flame size={18} className="mini-flame" />
            <div className="mini-text">
              <strong>High Severity Warning:</strong> Bagalkot Station Road Cluster (8 reports) needs immediate asphalt crew dispatch.
            </div>
            <ArrowRight size={15} className="mini-arrow" />
          </div>
        </div>
      </div>

      {/* Bottom: Recent Complaints Requiring Action */}
      <div className="dashboard-table-card card-box">
        <div className="section-header-flex">
          <div>
            <h3 className="section-title">Recent Intake Queue</h3>
            <p className="section-subtitle">Real-time grievances received and auto-routed</p>
          </div>
          <Link to="/authority/complaints" className="section-view-all-link">
            <span>Manage All Complaints</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive-wrapper">
          <table className="civic-data-table">
            <thead>
              <tr>
                <th style={{ width: '85px' }}>ID</th>
                <th>COMPLAINT</th>
                <th>CATEGORY</th>
                <th>PRIORITY</th>
                <th>DEPARTMENT</th>
                <th>LOCATION</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {complaints.slice(0, 5).map((c) => (
                <tr key={c.id} className="table-data-row">
                  <td className="cell-id">
                    <div className="id-number">#{c.id}</div>
                    {c.isDuplicate && <span className="dup-sub-tag">DUP OF #{c.duplicateOf}</span>}
                  </td>
                  <td className="cell-title">
                    <Link to={`/citizen/complaints/${c.id}`} className="complaint-title-link">
                      {c.title}
                    </Link>
                  </td>
                  <td><CategoryBadge category={c.category} size="small" /></td>
                  <td><PriorityBadge priority={c.priority} size="small" /></td>
                  <td className="cell-dept">{c.department}</td>
                  <td className="cell-location-text">{c.location}</td>
                  <td><StatusBadge status={c.status} size="small" /></td>
                  <td className="cell-action">
                    <button 
                      type="button" 
                      className="btn-manage-action"
                      onClick={() => setManageComplaint(c)}
                    >
                      <Edit3 size={13} />
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for complaint management */}
      {manageComplaint && (
        <ManageComplaintModal 
          isOpen={!!manageComplaint}
          onClose={() => setManageComplaint(null)}
          complaint={manageComplaint}
        />
      )}
    </div>
  );
}
