import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIAnalysisPanel } from '../../components/citizen/AIAnalysisPanel';
import { 
  Sparkles, 
  MapPin, 
  Navigation, 
  UploadCloud, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  Image as ImageIcon,
  X
} from 'lucide-react';
import { useCivicData } from '../../context/CivicDataContext';

export function SubmitComplaint() {
  const navigate = useNavigate();
  const { addComplaint } = useCivicData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('College Road, near BVVS Campus, Bagalkot');
  const [latitude, setLatitude] = useState('16.1825');
  const [longitude, setLongitude] = useState('75.6938');
  const [photoPreview, setPhotoPreview] = useState('https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80');
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  const handleGpsAutoLink = () => {
    setIsGpsLoading(true);
    setTimeout(() => {
      setLatitude('16.1825');
      setLongitude('75.6938');
      setAddress('College Road, near BVVS Campus, Bagalkot');
      setIsGpsLoading(false);
    }, 500);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Please provide both a Title and Description for the complaint.");
      return;
    }

    const created = addComplaint({
      title,
      description,
      location: address,
      coordinates: { lat: parseFloat(latitude) || 16.1825, lng: parseFloat(longitude) || 75.6938 },
      photoUrl: photoPreview
    });

    navigate(`/citizen/complaints/${created.id}`);
  };

  return (
    <div className="portal-page-container">
      {/* Top Header Card */}
      <div className="submit-header-card">
        <div className="submit-header-left">
          <div className="ai-enabled-pill">
            <Sparkles size={14} className="sparkle-icon" />
            <span>AI Auto Classification Enabled</span>
          </div>
          <h1 className="portal-page-title">Submit Civic Grievance</h1>
          <p className="portal-page-subtitle">
            Describe the issue and upload a photo. Category, priority, department, and duplicate check are calculated automatically.
          </p>
        </div>
        <div className="submit-header-right">
          <button 
            type="button" 
            className="btn-cancel-back"
            onClick={() => navigate('/citizen/complaints')}
          >
            <ArrowLeft size={16} />
            <span>Cancel & Back</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="submit-grid-layout">
        {/* Left Column: Form Card */}
        <div className="form-column-card">
          <form onSubmit={handleSubmit} className="grievance-form">
            {/* Field: Complaint Title */}
            <div className="form-group">
              <label className="form-label">
                Complaint Title <span className="req-star">*</span>
              </label>
              <input 
                type="text"
                placeholder="e.g. Broken Streetlight on College Road"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {/* Field: Detailed Description */}
            <div className="form-group">
              <label className="form-label">
                Detailed Description <span className="req-star">*</span>
              </label>
              <textarea 
                rows={4}
                placeholder="Provide details about the civic problem, duration, severity, and exact spot."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="form-textarea"
              />
            </div>

            {/* Section: Location & Coordinates */}
            <div className="location-section-box">
              <div className="location-section-header">
                <div className="loc-title-group">
                  <MapPin size={17} className="loc-header-icon" />
                  <span className="loc-section-title">Location & Coordinates</span>
                </div>
                <button 
                  type="button" 
                  className={`gps-autolink-btn ${isGpsLoading ? 'gps-active' : ''}`}
                  onClick={handleGpsAutoLink}
                  title="Auto-fetch current device GPS coordinates"
                >
                  <Navigation size={14} />
                  <span>{isGpsLoading ? 'LINKING GPS...' : 'GPS AUTO-LINK'}</span>
                </button>
              </div>

              <div className="form-group" style={{ marginBottom: '0.9rem' }}>
                <label className="form-sublabel">Address / Landmark</label>
                <input 
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. College Road, near BVVS Campus, Bagalkot"
                  className="form-input form-input-compact"
                />
              </div>

              <div className="coordinates-row">
                <div className="coord-field">
                  <label className="form-sublabel">Latitude</label>
                  <input 
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="form-input form-input-compact"
                  />
                </div>
                <div className="coord-field">
                  <label className="form-sublabel">Longitude</label>
                  <input 
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="form-input form-input-compact"
                  />
                </div>
              </div>
            </div>

            {/* Section: Upload Photo Proof */}
            <div className="photo-upload-section">
              <label className="form-label">Upload Photo Proof</label>
              
              {photoPreview ? (
                <div className="photo-preview-container">
                  <img src={photoPreview} alt="Grievance evidence preview" className="photo-preview-img" />
                  <div className="photo-overlay-actions">
                    <span className="gps-verified-tag">
                      <CheckCircle2 size={13} />
                      <span>GPS Verified Photo</span>
                    </span>
                    <button 
                      type="button" 
                      className="photo-remove-btn"
                      onClick={() => setPhotoPreview(null)}
                      aria-label="Remove photo"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="upload-dropzone">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="file-hidden-input"
                  />
                  <UploadCloud size={36} className="upload-icon" />
                  <span className="upload-primary-text">Click to upload photo or drag & drop</span>
                  <span className="upload-hint-text">PNG, JPG, or WEBP (Max 10MB) — EXIF Geolocation auto-parsed</span>
                </label>
              )}
            </div>

            {/* Form Submit Action Button */}
            <div className="form-submit-row">
              <button type="submit" className="submit-grievance-btn">
                <Send size={17} />
                <span>Submit Civic Grievance to AI Pipeline</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live AI Analysis Engine */}
        <div className="ai-column-card">
          <AIAnalysisPanel 
            title={title} 
            description={description} 
            location={address} 
          />
        </div>
      </div>
    </div>
  );
}
