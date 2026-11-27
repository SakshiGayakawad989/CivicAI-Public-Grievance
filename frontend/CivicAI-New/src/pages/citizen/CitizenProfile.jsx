import React, { useEffect, useState } from 'react';
import { useCivicData } from '../../context/CivicDataContext';

import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Save,
  CheckCircle2,
  Building
} from 'lucide-react';

export function CitizenProfile() {
  const {
    citizenProfile,
    storedUser,
    updateCitizenProfile
  } = useCivicData();

  // =========================================================
  // CURRENT LOGGED-IN USER
  // =========================================================

  const currentUser =
    citizenProfile || storedUser || {};

  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    address: currentUser.address || '',
    ward: currentUser.ward || '',
    city: currentUser.city || '',
    smsAlerts:
      currentUser.notifications?.smsAlerts ??
      true,
    emailUpdates:
      currentUser.notifications?.emailUpdates ??
      true,
    aiDeduplicationNotices:
      currentUser.notifications
        ?.aiDeduplicationNotices ??
      true,
    slaReminders:
      currentUser.notifications?.slaReminders ??
      true
  });

  // =========================================================
  // UPDATE FORM WHEN USER CHANGES
  // =========================================================

  useEffect(() => {
    const user =
      citizenProfile || storedUser || {};

    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      ward: user.ward || '',
      city: user.city || '',

      smsAlerts:
        user.notifications?.smsAlerts ??
        true,

      emailUpdates:
        user.notifications?.emailUpdates ??
        true,

      aiDeduplicationNotices:
        user.notifications
          ?.aiDeduplicationNotices ??
        true,

      slaReminders:
        user.notifications?.slaReminders ??
        true
    });
  }, [citizenProfile, storedUser]);

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === 'checkbox'
          ? checked
          : value
    }));
  };

  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    updateCitizenProfile({
      id:
        currentUser.id ||
        currentUser.userId ||
        null,

      userId:
        currentUser.userId ||
        currentUser.id ||
        null,

      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      ward: formData.ward,
      city: formData.city,

      title:
        currentUser.title ||
        'Verified Resident',

      aadhaarVerified:
        currentUser.aadhaarVerified ??
        true,

      notifications: {
        smsAlerts:
          formData.smsAlerts,

        emailUpdates:
          formData.emailUpdates,

        aiDeduplicationNotices:
          formData.aiDeduplicationNotices,

        slaReminders:
          formData.slaReminders
      }
    });

    alert('Profile updated successfully.');
  };

  // =========================================================
  // AVATAR
  // =========================================================

  const displayName =
    formData.name || 'Citizen';

  const avatarInitial =
    displayName
      .charAt(0)
      .toUpperCase();

  // =========================================================
  // CITIZEN ID
  // =========================================================

  const citizenId =
    currentUser.id ||
    currentUser.userId ||
    'Not Available';

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="portal-page-container">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="portal-page-header-row">

        <div>

          <h1 className="portal-page-title">
            Citizen Profile & Settings
          </h1>

          <p className="portal-page-subtitle">
            Manage your verified resident credentials,
            ward preferences, and automated SMS/Email alerts
          </p>

        </div>

      </div>

      <form
        onSubmit={handleSubmit}
        className="profile-layout-grid"
      >

        {/* ===================================================
            LEFT CARD
        =================================================== */}

        <div className="profile-left-column">

          <div className="profile-avatar-card card-box">

            {/* AVATAR */}

            <div
              className="avatar-large-circle"
              style={{
                backgroundColor:
                  currentUser.avatarColor ||
                  '#20D4D0'
              }}
            >
              {avatarInitial}
            </div>

            {/* NAME */}

            <h2 className="profile-user-name">
              {displayName}
            </h2>

            {/* ROLE */}

            <div className="profile-role-badge">

              <ShieldCheck size={14} />

              <span>
                {currentUser.title ||
                  'Verified Resident'}
              </span>

            </div>

            {/* META */}

            <div className="profile-meta-list">

              {/* AADHAAR */}

              <div className="profile-meta-item">

                <span className="meta-k">
                  Aadhaar Status:
                </span>

                <span className="meta-v verified-tag">

                  <CheckCircle2 size={13} />

                  <span>
                    {currentUser.aadhaarVerified === false
                      ? 'Not Verified'
                      : 'Verified (UIDAI)'}
                  </span>

                </span>

              </div>

              {/* CITIZEN ID */}

              <div className="profile-meta-item">

                <span className="meta-k">
                  Citizen ID:
                </span>

                <span className="meta-v">
                  {citizenId}
                </span>

              </div>

              {/* WARD */}

              <div className="profile-meta-item">

                <span className="meta-k">
                  Assigned Ward:
                </span>

                <span className="meta-v">
                  {formData.ward ||
                    'Not Assigned'}
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            RIGHT CARD
        =================================================== */}

        <div className="profile-right-column">

          <div className="profile-details-card card-box">

            <h3 className="profile-section-heading">
              Personal Information
            </h3>

            <div className="profile-form-grid">

              {/* NAME */}

              <div className="form-group">

                <label className="form-label">
                  Full Name
                </label>

                <div className="input-icon-wrap">

                  <User
                    size={16}
                    className="field-icon"
                  />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />

                </div>

              </div>

              {/* EMAIL */}

              <div className="form-group">

                <label className="form-label">
                  Email Address
                </label>

                <div className="input-icon-wrap">

                  <Mail
                    size={16}
                    className="field-icon"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />

                </div>

              </div>

              {/* PHONE */}

              <div className="form-group">

                <label className="form-label">
                  Phone Number
                </label>

                <div className="input-icon-wrap">

                  <Phone
                    size={16}
                    className="field-icon"
                  />

                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />

                </div>

              </div>

              {/* WARD */}

              <div className="form-group">

                <label className="form-label">
                  Ward / Sector
                </label>

                <div className="input-icon-wrap">

                  <Building
                    size={16}
                    className="field-icon"
                  />

                  <input
                    type="text"
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />

                </div>

              </div>

              {/* ADDRESS */}

              <div className="form-group full-width">

                <label className="form-label">
                  Residential Address
                </label>

                <div className="input-icon-wrap">

                  <MapPin
                    size={16}
                    className="field-icon"
                  />

                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your residential address"
                  />

                </div>

              </div>

            </div>

            <hr className="profile-divider" />

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <h3 className="profile-section-heading">
              Notification & AI Alert Preferences
            </h3>

            <div className="preferences-list">

              {/* SMS */}

              <label className="pref-checkbox-row">

                <input
                  type="checkbox"
                  name="smsAlerts"
                  checked={
                    formData.smsAlerts
                  }
                  onChange={handleChange}
                />

                <div className="pref-label-text">

                  <strong>
                    SMS Real-Time Status Updates
                  </strong>

                  <span>
                    Receive SMS notifications when
                    squad is dispatched to your
                    grievance location
                  </span>

                </div>

              </label>

              {/* AI */}

              <label className="pref-checkbox-row">

                <input
                  type="checkbox"
                  name="aiDeduplicationNotices"
                  checked={
                    formData.aiDeduplicationNotices
                  }
                  onChange={handleChange}
                />

                <div className="pref-label-text">

                  <strong>
                    AI Duplicate Ticket Synchronization Notices
                  </strong>

                  <span>
                    Notify when your ticket is
                    clustered with a Master
                    neighborhood ticket
                  </span>

                </div>

              </label>

              {/* SLA */}

              <label className="pref-checkbox-row">

                <input
                  type="checkbox"
                  name="slaReminders"
                  checked={
                    formData.slaReminders
                  }
                  onChange={handleChange}
                />

                <div className="pref-label-text">

                  <strong>
                    Resolution Verification & Rating Prompts
                  </strong>

                  <span>
                    Prompts to evaluate squad
                    resolution quality after
                    ticket closure
                  </span>

                </div>

              </label>

            </div>

            {/* =================================================
                SAVE
            ================================================= */}

            <div className="profile-actions-row">

              <button
                type="submit"
                className="btn-primary-action"
              >

                <Save size={16} />

                <span>
                  Save Profile Changes
                </span>

              </button>

            </div>

          </div>

        </div>

      </form>

    </div>
  );
}

export default CitizenProfile;