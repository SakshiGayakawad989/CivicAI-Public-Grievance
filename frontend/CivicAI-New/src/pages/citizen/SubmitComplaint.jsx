
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Sparkles,
  MapPin,
  UploadCloud,
  ArrowLeft,
  Send,
  CheckCircle2,
  X,
  Navigation,
  LoaderCircle
} from 'lucide-react';

import { useCivicData } from '../../context/CivicDataContext';

export function SubmitComplaint() {
  const navigate = useNavigate();
  const { users } = useCivicData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationSource, setLocationSource] = useState('');
  const [gpsCaptured, setGpsCaptured] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GET LOGGED-IN CITIZEN
  const getLoggedInCitizen = () => {
    const storageKeys = ['civicai_user', 'civicaiUser'];

    for (const key of storageKeys) {
      try {
        const storedUser = localStorage.getItem(key);

        if (!storedUser) continue;

        const parsedUser = JSON.parse(storedUser);

        if (parsedUser) return parsedUser;
      } catch (error) {
        console.error(`Error reading ${key}:`, error);
      }
    }

    if (users?.citizen) return users.citizen;

    return null;
  };

  // GET NUMERIC BACKEND USER ID
  const getNumericUserId = (citizen) => {
    if (!citizen) return null;

    const possibleIds = [
      citizen.id,
      citizen.userId,
      citizen.user?.id
    ];

    for (const value of possibleIds) {
      const numericId = Number(value);

      if (Number.isInteger(numericId) && numericId > 0) {
        return numericId;
      }
    }

    return null;
  };

  // VALIDATE COORDINATES
  const areValidCoordinates = (lat, lon) => {
    if (
      lat === '' ||
      lon === '' ||
      lat == null ||
      lon == null ||
      String(lat).trim() === '' ||
      String(lon).trim() === ''
    ) {
      return false;
    }

    const latNumber = Number(lat);
    const lonNumber = Number(lon);

    return (
      Number.isFinite(latNumber) &&
      Number.isFinite(lonNumber) &&
      latNumber >= -90 &&
      latNumber <= 90 &&
      lonNumber >= -180 &&
      lonNumber <= 180
    );
  };

  // GPS AUTO-LINK: GET CURRENT LOCATION AND ADDRESS
  const handleGetGPSLocation = () => {
    if (isGpsLoading || isSubmitting) return;

    if (!window.isSecureContext) {
      alert(
        'Location access requires HTTPS or localhost. ' +
        'Please open your application using localhost.'
      );
      return;
    }

    if (!navigator.geolocation) {
      alert('GPS is not supported by this browser.');
      return;
    }

    setIsGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const latString = lat.toFixed(6);
        const lonString = lon.toFixed(6);

        setLatitude(latString);
        setLongitude(lonString);
        setLocationSource('GPS');
        setGpsCaptured(true);

        console.log('GPS coordinates captured:', {
          latitude: lat,
          longitude: lon,
          accuracyMeters: position.coords.accuracy
        });

        try {
          const url = new URL(
            'https://nominatim.openstreetmap.org/reverse'
          );

          url.searchParams.set('format', 'jsonv2');
          url.searchParams.set('lat', String(lat));
          url.searchParams.set('lon', String(lon));

          const response = await fetch(url.toString(), {
            headers: {
              Accept: 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Unable to retrieve the readable address.');
          }

          const data = await response.json();

          setAddress(
            data.display_name || `${latString}, ${lonString}`
          );

          alert('GPS location and address captured successfully.');
        } catch (error) {
          console.error('GPS address lookup failed:', error);

          // Coordinates remain available even if address lookup fails.
          setAddress(`${latString}, ${lonString}`);

          alert(
            'GPS coordinates captured, but the readable address ' +
            'could not be retrieved. The coordinates will be used.'
          );
        } finally {
          setIsGpsLoading(false);
        }
      },
      (error) => {
        console.error('GPS error:', error);
        setIsGpsLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          alert(
            'Location permission denied. Allow location access ' +
            'in your browser settings and try again.'
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          alert(
            'Your current location is unavailable. ' +
            'Please enable device Location Services and try again.'
          );
        } else if (error.code === error.TIMEOUT) {
          alert('Getting your location timed out. Please try again.');
        } else {
          alert('Unable to get your GPS location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }
    );
  };

  // ADDRESS INPUT CHANGE
  const handleAddressChange = (event) => {
    setAddress(event.target.value);
    setLatitude('');
    setLongitude('');
    setLocationSource('');
    setGpsCaptured(false);
  };

  // MANUAL COORDINATE CHANGES
  const handleLatitudeChange = (event) => {
    setLatitude(event.target.value);
    setLocationSource('MANUAL');
    setGpsCaptured(false);
  };

  const handleLongitudeChange = (event) => {
    setLongitude(event.target.value);
    setLocationSource('MANUAL');
    setGpsCaptured(false);
  };

  // IMAGE UPLOAD
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10 MB.');
      event.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      event.target.value = '';
      return;
    }

    setSelectedImage(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // REMOVE IMAGE
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPhotoPreview(null);

    const fileInput = document.getElementById('complaint-image');

    if (fileInput) fileInput.value = '';
  };

  // SUBMIT COMPLAINT
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting || isGpsLoading) return;

    if (!title.trim()) {
      alert('Please enter the complaint title.');
      return;
    }

    if (!description.trim()) {
      alert('Please enter the complaint description.');
      return;
    }

    if (!address.trim()) {
      alert('Please capture your GPS location or enter an address.');
      return;
    }

    if (!areValidCoordinates(latitude, longitude)) {
      alert(
        'Please click GPS AUTO-LINK or enter valid latitude ' +
        'and longitude manually.'
      );
      return;
    }

    const latitudeNumber = Number(latitude);
    const longitudeNumber = Number(longitude);

    const citizen = getLoggedInCitizen();

    if (!citizen) {
      alert('Citizen information not found. Please login again.');
      return;
    }

    const numericUserId = getNumericUserId(citizen);

    if (!numericUserId) {
      alert(
        'Your account does not have a valid backend user ID. ' +
        'Please logout and login again.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('location', address.trim());
      formData.append('latitude', String(latitudeNumber));
      formData.append('longitude', String(longitudeNumber));
      formData.append('userId', String(numericUserId));

      if (selectedImage) {
        formData.append('image', selectedImage, selectedImage.name);
      }

      console.log('Submitting complaint:', {
        title: title.trim(),
        description: description.trim(),
        location: address.trim(),
        latitude: latitudeNumber,
        longitude: longitudeNumber,
        locationSource,
        userId: numericUserId,
        image: selectedImage ? selectedImage.name : 'No image'
      });

      const response = await fetch(
        'http://localhost:8080/api/complaints',
        {
          method: 'POST',
          body: formData
        }
      );

      const responseText = await response.text();

      console.log('Backend response:', responseText);

      if (!response.ok) {
        throw new Error(
          responseText ||
          `Complaint submission failed. HTTP ${response.status}`
        );
      }

      if (!responseText) {
        throw new Error(
          'Backend returned an empty response after submitting the complaint.'
        );
      }

      let savedComplaint;

      try {
        savedComplaint = JSON.parse(responseText);
      } catch (error) {
        console.error('Invalid JSON from backend:', error);

        throw new Error(
          'The backend returned an invalid response after submission.'
        );
      }

      const savedComplaintId = Number(savedComplaint?.id);

      if (
        !Number.isInteger(savedComplaintId) ||
        savedComplaintId <= 0
      ) {
        throw new Error(
          'No valid complaint ID was returned by the backend.'
        );
      }

      alert(`Complaint #${savedComplaintId} submitted successfully!`);

      navigate(`/citizen/complaints/${savedComplaintId}`, {
        state: { complaint: savedComplaint }
      });
    } catch (error) {
      console.error('Complaint submission failed:', error);

      alert(
        error?.message ||
        'Unable to submit complaint. Make sure the backend server is running.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI
  return (
    <div className="portal-page-container">

      {/* HEADER */}
      <div className="submit-header-card">
        <div className="submit-header-left">
          <div className="ai-enabled-pill">
            <Sparkles size={14} className="sparkle-icon" />
            <span>AI Auto Classification Enabled</span>
          </div>

          <h1 className="portal-page-title">
            Submit Civic Grievance
          </h1>

          <p className="portal-page-subtitle">
            Describe the issue and upload a photo.
            Category, priority, department, and duplicate
            check are calculated automatically.
          </p>
        </div>

        <div className="submit-header-right">
          <button
            type="button"
            className="btn-cancel-back"
            onClick={() => navigate('/citizen/complaints')}
            disabled={isSubmitting}
          >
            <ArrowLeft size={16} />
            <span>Cancel &amp; Back</span>
          </button>
        </div>
      </div>

      {/* COMPLAINT FORM */}
      <div className="submit-grid-layout">
        <div className="form-column-card">
          <form onSubmit={handleSubmit} className="grievance-form">

            {/* TITLE */}
            <div className="form-group">
              <label htmlFor="complaint-title" className="form-label">
                Complaint Title <span className="req-star">*</span>
              </label>

              <input
                id="complaint-title"
                type="text"
                placeholder="e.g. Broken Streetlight on College Road"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                disabled={isSubmitting}
                className="form-input"
              />
            </div>

            {/* DESCRIPTION */}
            <div className="form-group">
              <label htmlFor="complaint-description" className="form-label">
                Detailed Description <span className="req-star">*</span>
              </label>

              <textarea
                id="complaint-description"
                rows={4}
                placeholder="Describe the issue, duration, severity, and exact spot."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                disabled={isSubmitting}
                className="form-textarea"
              />
            </div>

            {/* LOCATION */}
            <div className="location-section-box">
              <div className="location-section-header">
                <div className="loc-title-group">
                  <MapPin size={17} className="loc-header-icon" />
                  <span className="loc-section-title">
                    Complaint Location
                  </span>
                </div>
              </div>

              {/* ADDRESS */}
              <div
                className="form-group"
                style={{ marginBottom: '0.9rem' }}
              >
                <label htmlFor="complaint-address" className="form-sublabel">
                  Address / Landmark
                </label>

                <input
                  id="complaint-address"
                  type="text"
                  value={address}
                  onChange={handleAddressChange}
                  placeholder="Enter an address or use GPS AUTO-LINK"
                  className="form-input form-input-compact"
                  required
                  disabled={isSubmitting}
                />

                {/* GPS AUTO-LINK ONLY */}
                <button
                  type="button"
                  className="gps-autolink-btn"
                  style={{
                    marginTop: '0.65rem',
                    width: 'fit-content'
                  }}
                  onClick={handleGetGPSLocation}
                  disabled={isGpsLoading || isSubmitting}
                >
                  {isGpsLoading ? (
                    <LoaderCircle size={14} />
                  ) : (
                    <Navigation size={14} />
                  )}

                  <span>
                    {isGpsLoading
                      ? 'GETTING LOCATION...'
                      : 'GPS AUTO-LINK'}
                  </span>
                </button>

                <p
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '0.8rem',
                    color: '#64748b'
                  }}
                >
                  GPS AUTO-LINK captures your device's current location
                  and fills the address when available. GPS requires
                  location permission and may be approximate.
                </p>
              </div>

              {/* COORDINATES */}
              <div className="coordinates-row">
                <div className="coord-field">
                  <label htmlFor="complaint-latitude" className="form-sublabel">
                    Latitude
                  </label>

                  <input
                    id="complaint-latitude"
                    type="number"
                    value={latitude}
                    onChange={handleLatitudeChange}
                    placeholder="Latitude"
                    className="form-input form-input-compact"
                    min="-90"
                    max="90"
                    step="any"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="coord-field">
                  <label htmlFor="complaint-longitude" className="form-sublabel">
                    Longitude
                  </label>

                  <input
                    id="complaint-longitude"
                    type="number"
                    value={longitude}
                    onChange={handleLongitudeChange}
                    placeholder="Longitude"
                    className="form-input form-input-compact"
                    min="-180"
                    max="180"
                    step="any"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {latitude !== '' && longitude !== '' && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    color: '#15803d',
                    fontSize: '0.85rem'
                  }}
                >
                  <CheckCircle2
                    size={14}
                    style={{
                      display: 'inline',
                      verticalAlign: 'middle',
                      marginRight: '0.35rem'
                    }}
                  />

                  Coordinates available.

                  <div style={{ marginTop: '0.35rem' }}>
                    Location method:{' '}
                    <strong>
                      {locationSource === 'GPS'
                        ? 'Current device GPS'
                        : 'Manual coordinate entry'}
                    </strong>
                  </div>
                </div>
              )}

              {gpsCaptured && (
                <p style={{ color: '#15803d', fontSize: '0.85rem' }}>
                  GPS location captured successfully.
                </p>
              )}
            </div>

            {/* IMAGE UPLOAD */}
            <div className="photo-upload-section">
              <label className="form-label" htmlFor="complaint-image">
                Upload Photo Proof
              </label>

              {photoPreview ? (
                <div className="photo-preview-container">
                  <img
                    src={photoPreview}
                    alt="Grievance evidence preview"
                    className="photo-preview-img"
                  />

                  <div className="photo-overlay-actions">
                    <span className="gps-verified-tag">
                      <CheckCircle2 size={13} />
                      <span>Photo Selected</span>
                    </span>

                    <button
                      type="button"
                      className="photo-remove-btn"
                      onClick={handleRemoveImage}
                      aria-label="Remove photo"
                      disabled={isSubmitting}
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="upload-dropzone">
                  <input
                    id="complaint-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file-hidden-input"
                    disabled={isSubmitting}
                  />

                  <UploadCloud size={36} className="upload-icon" />

                  <span className="upload-primary-text">
                    Click to upload photo or drag &amp; drop
                  </span>

                  <span className="upload-hint-text">
                    PNG, JPG, or WEBP (Max 10MB)
                  </span>
                </label>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="form-submit-row">
              <button
                type="submit"
                className="submit-grievance-btn"
                disabled={isSubmitting || isGpsLoading}
              >
                {isSubmitting ? (
                  <LoaderCircle size={17} />
                ) : (
                  <Send size={17} />
                )}

                <span>
                  {isSubmitting
                    ? 'Submitting...'
                    : 'Submit Civic Grievance to AI Pipeline'}
                </span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default SubmitComplaint;
