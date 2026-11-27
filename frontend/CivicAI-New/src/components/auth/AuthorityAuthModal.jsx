import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCivicData } from '../../context/CivicDataContext';
import { 
  X, 
  Shield, 
  Mail, 
  Lock, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  KeyRound,
  ShieldCheck
} from 'lucide-react';

export function AuthorityAuthModal({ isOpen, onClose, targetRoute = '/authority/dashboard' }) {
  const navigate = useNavigate();
  const { setRole, users, showToast } = useCivicData();
  const officer = users.authority;

  const [email, setEmail] = useState(officer.email || 'sb.kulkarni@bagalkotcmc.gov.in');
  const [password, setPassword] = useState('officer@123');
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setRole('authority');
    showToast(`Officer authenticated: ${officer.name} (${officer.title})`, "success");
    onClose();
    navigate(targetRoute);
  };

  const handleQuickDemoFill = () => {
    setEmail('sb.kulkarni@bagalkotcmc.gov.in');
    setPassword('officer@123');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="auth-modal-container authority-auth-container" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        {/* Modal Header */}
        <div className="auth-modal-header" style={{ background: '#0B1730', color: '#FFFFFF', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="auth-header-left">
            <div className="auth-logo-badge" style={{ background: 'linear-gradient(135deg, #1677F0 0%, #2563EB 100%)' }}>
              <Shield size={22} />
            </div>
            <div>
              <h3 className="auth-modal-title" style={{ color: '#FFFFFF' }}>Government Officer Login</h3>
              <p className="auth-modal-sub" style={{ color: '#94A3B8' }}>Municipal Command & Grievance Triage Portal</p>
            </div>
          </div>
          <button className="modal-close-btn" style={{ color: '#94A3B8' }} onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Form */}
        <div className="auth-modal-body" style={{ padding: '2rem' }}>
          <form onSubmit={handleLoginSubmit} className="auth-form-body">
            
            {/* Officer Security Notice */}
            <div className="officer-auth-banner">
              <ShieldCheck size={18} className="shield-notice-icon" />
              <div>
                <strong>Restricted Official Access</strong>
                <p>Bagalkot City Municipal Corporation Administrative Network</p>
              </div>
            </div>

            {/* Email Field */}
            <div className="auth-input-group">
              <label className="auth-label">Official Govt. Email Address</label>
              <div className="input-icon-wrap">
                <Mail size={16} className="field-icon" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@bagalkotcmc.gov.in"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="auth-input-group">
              <div className="label-with-hint">
                <label className="auth-label">Password</label>
                <span className="otp-hint-badge" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>Demo: officer@123</span>
              </div>
              <div className="input-icon-wrap">
                <Lock size={16} className="field-icon" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Remember Me & Quick fill */}
            <div className="auth-extras-row">
              <label className="remember-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                />
                <span>Keep officer session active</span>
              </label>

              <button 
                type="button" 
                className="btn-quick-fill"
                onClick={handleQuickDemoFill}
              >
                Auto-fill Officer
              </button>
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn-resident-submit btn-authority-submit">
              <Shield size={16} />
              <span>Authenticate & Enter Command Center</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
