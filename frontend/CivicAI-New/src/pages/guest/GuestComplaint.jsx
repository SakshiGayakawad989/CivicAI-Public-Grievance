
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  Send,
  MapPin,
  Navigation,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  X,
  LoaderCircle
} from 'lucide-react';

import { useCivicData } from '../../context/CivicDataContext';

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 12px 12px 42px',
  border: '1px solid #cbd5e1',
  borderRadius: '9px',
  outline: 'none',
  fontSize: '14px',
  background: '#ffffff',
  color: '#0f172a'
};

const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: '600',
  fontSize: '13px',
  color: '#334155'
};

const requiredMark = {
  color: '#dc2626'
};

export function GuestComplaint() {
  const navigate = useNavigate();
  const { addComplaint, showToast } = useCivicData();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsCaptured, setGpsCaptured] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  // Clean up temporary image preview URLs.
  useEffect(() => {
    if (!imagePreview) return undefined;

    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  // ---------------------------------------------------------
  // GPS AUTO-LINK + AUTOMATIC ADDRESS LOOKUP
  // ---------------------------------------------------------

  const handleGpsAutoLink = () => {
    if (isGpsLoading || isSubmitting) return;

    if (!window.isSecureContext) {
      alert(
        'Location access requires HTTPS or localhost. Please open the application using localhost.'
      );
      return;
    }

    if (!navigator.geolocation) {
      alert(
        'GPS is not supported by this browser. Please enter the address manually.'
      );
      return;
    }

    setIsGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const latString = lat.toFixed(6);
        const lngString = lng.toFixed(6);

        setLatitude(latString);
        setLongitude(lngString);
        setGpsCaptured(true);

        try {
          // Reverse geocoding: GPS coordinates -> readable address.
          const url = new URL(
            'https://nominatim.openstreetmap.org/reverse'
          );

          url.searchParams.set('format', 'jsonv2');
          url.searchParams.set('lat', String(lat));
          url.searchParams.set('lon', String(lng));

          const response = await fetch(url.toString(), {
            headers: {
              Accept: 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(
              `Address lookup failed with status ${response.status}`
            );
          }

          const data = await response.json();

          const automaticAddress =
            data.display_name ||
            data.name ||
            `${latString}, ${lngString}`;

          setLocation(automaticAddress);

          alert(
            'GPS location and address captured successfully.'
          );
        } catch (error) {
          console.error('Reverse geocoding error:', error);

          // GPS capture still succeeds if address lookup fails.
          setLocation(`${latString}, ${lngString}`);

          alert(
            'GPS coordinates captured successfully, but the readable address could not be retrieved. The coordinates will be used as the location.'
          );
        } finally {
          setIsGpsLoading(false);
        }
      },
      (error) => {
        console.error('Guest GPS error:', error);

        setIsGpsLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          alert(
            'Location permission denied. Please enable device Location Services and allow location access in your browser settings.'
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          alert(
            'Your current location is unavailable. Please turn on device Location Services and try again.'
          );
        } else if (error.code === error.TIMEOUT) {
          alert(
            'Getting your location timed out. Please try again.'
          );
        } else {
          alert(
            'Unable to get your location. Please enable location access and try again.'
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }
    );
  };

  // ---------------------------------------------------------
  // IMAGE UPLOAD
  // ---------------------------------------------------------

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      event.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size must not exceed 10 MB.', 'error');
      event.target.value = '';
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview('');

    const fileInput = document.getElementById(
      'guest-complaint-image'
    );

    if (fileInput) {
      fileInput.value = '';
    }
  };

  // ---------------------------------------------------------
  // RESET FORM
  // ---------------------------------------------------------

  const resetForm = () => {
    setTitle('');
    setLocation('');
    setLatitude('');
    setLongitude('');
    setDescription('');
    setGpsCaptured(false);
    handleRemoveImage();
  };

  // ---------------------------------------------------------
  // SUBMIT COMPLAINT
  // ---------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting || isGpsLoading) return;

    if (!title.trim()) {
      showToast('Please enter the complaint title.', 'error');
      return;
    }

    if (!description.trim()) {
      showToast('Please describe the civic problem.', 'error');
      return;
    }

    // The address can be empty only when GPS was captured.
    if (!location.trim() && !gpsCaptured) {
      showToast(
        'Please capture your GPS location or enter an address.',
        'error'
      );
      return;
    }

    let latitudeNumber = null;
    let longitudeNumber = null;

    if (latitude !== '' || longitude !== '') {
      latitudeNumber = Number(latitude);
      longitudeNumber = Number(longitude);

      if (
        latitude === '' ||
        longitude === '' ||
        !Number.isFinite(latitudeNumber) ||
        !Number.isFinite(longitudeNumber) ||
        latitudeNumber < -90 ||
        latitudeNumber > 90 ||
        longitudeNumber < -180 ||
        longitudeNumber > 180
      ) {
        showToast(
          'The GPS coordinates are invalid. Please capture your location again.',
          'error'
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const complaintData = {
        title: title.trim(),
        location: location.trim(),
        latitude: latitudeNumber,
        longitude: longitudeNumber,
        description: description.trim(),
        image: image || null
      };

      console.log('Submitting guest complaint:', {
        ...complaintData,
        image: image ? image.name : null
      });

      // Keep the existing CivicDataContext submission flow.
      const complaint = await addComplaint(complaintData, null);

      if (complaint) {
        setSubmittedComplaint(complaint);
        resetForm();
      } else {
        showToast(
          'The complaint was not submitted. Please try again.',
          'error'
        );
      }
    } catch (error) {
      console.error('Guest complaint submission error:', error);

      showToast(
        error?.message ||
          'Unable to submit the complaint. Please try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // SUCCESS SCREEN
  // ---------------------------------------------------------

  if (submittedComplaint) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
          background: '#f5f7fb'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '600px',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '36px',
            boxSizing: 'border-box',
            textAlign: 'center',
            boxShadow: '0 10px 35px rgba(0,0,0,0.08)'
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '34px',
              fontWeight: '700'
            }}
          >
            ✓
          </div>

          <h1 style={{ margin: '0 0 12px', color: '#0f172a' }}>
            Complaint Submitted Successfully
          </h1>

          <p style={{ color: '#64748b', lineHeight: '1.7' }}>
            Your civic complaint has been submitted successfully.
          </p>

          {submittedComplaint.id != null && (
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '10px',
                padding: '14px',
                margin: '20px 0',
                color: '#334155'
              }}
            >
              <strong>Complaint ID:</strong> #{submittedComplaint.id}
            </div>
          )}

          <p
            style={{
              fontSize: '13px',
              color: '#64748b',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}
          >
            Since you submitted as a guest, complaint tracking and
            complaint history may not be available.
          </p>

          <button
            type="button"
            onClick={() => setSubmittedComplaint(null)}
            style={{
              border: 'none',
              borderRadius: '9px',
              padding: '13px 20px',
              background: '#2563eb',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: '600',
              margin: '0 6px 10px'
            }}
          >
            Submit Another Complaint
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              border: '1px solid #cbd5e1',
              borderRadius: '9px',
              padding: '13px 20px',
              background: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
              fontWeight: '600',
              margin: '0 6px 10px'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // GUEST COMPLAINT FORM
  // ---------------------------------------------------------

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
        padding: '24px',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* HEADER */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            disabled={isSubmitting}
            aria-label="Back to home"
            style={{
              width: '40px',
              height: '40px',
              flexShrink: 0,
              border: '1px solid #e2e8f0',
              borderRadius: '9px',
              background: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '24px',
                color: '#0f172a'
              }}
            >
              Report a Civic Issue
            </h1>

            <p
              style={{
                margin: '5px 0 0',
                color: '#64748b',
                fontSize: '13px'
              }}
            >
              Continue as Guest
            </p>
          </div>
        </div>

        {/* INFORMATION */}

        <div
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '11px',
            padding: '14px',
            marginBottom: '16px',
            color: '#1d4ed8',
            fontSize: '13px',
            lineHeight: '1.6'
          }}
        >
          <strong>Guest Complaint</strong>

          <div style={{ marginTop: '4px' }}>
            Report a civic issue without creating an account.
            The complaint category will be identified automatically
            by the system.
          </div>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          style={{
            background: '#ffffff',
            borderRadius: '15px',
            padding: '24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
          }}
        >
          {/* TITLE */}

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="guest-title" style={labelStyle}>
              Complaint Title <span style={requiredMark}>*</span>
            </label>

            <div style={{ position: 'relative' }}>
              <FileText
                size={17}
                style={{
                  position: 'absolute',
                  left: '13px',
                  top: '13px',
                  color: '#64748b'
                }}
              />

              <input
                id="guest-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter complaint title"
                disabled={isSubmitting}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* LOCATION AND GPS */}

          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '8px'
              }}
            >
              <label
                htmlFor="guest-location"
                style={{ ...labelStyle, margin: 0 }}
              >
                Location / Address
                {!gpsCaptured && (
                  <span style={requiredMark}> *</span>
                )}
              </label>

              <button
                type="button"
                onClick={handleGpsAutoLink}
                disabled={isGpsLoading || isSubmitting}
                title="Capture your current GPS location"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  border: '1px solid #93c5fd',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  cursor:
                    isGpsLoading || isSubmitting
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    isGpsLoading || isSubmitting ? 0.7 : 1,
                  fontSize: '11px',
                  fontWeight: '700'
                }}
              >
                {isGpsLoading ? (
                  <LoaderCircle size={15} />
                ) : (
                  <Navigation size={15} />
                )}

                {isGpsLoading
                  ? 'GETTING LOCATION...'
                  : 'GPS AUTO-LINK'}
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <MapPin
                size={17}
                style={{
                  position: 'absolute',
                  left: '13px',
                  top: '13px',
                  color: '#64748b'
                }}
              />

              <input
                id="guest-location"
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder={
                  gpsCaptured
                    ? 'Location captured automatically'
                    : 'Enter address or use GPS AUTO-LINK'
                }
                disabled={isSubmitting}
                required={!gpsCaptured}
                style={inputStyle}
              />
            </div>

            {/* COORDINATES */}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginTop: '12px'
              }}
            >
              <div>
                <label
                  htmlFor="guest-latitude"
                  style={{ ...labelStyle, marginBottom: '6px' }}
                >
                  Latitude
                </label>

                <input
                  id="guest-latitude"
                  type="text"
                  value={latitude}
                  readOnly
                  placeholder="Captured using GPS"
                  style={{
                    ...inputStyle,
                    padding: '11px 12px',
                    background: '#f8fafc'
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="guest-longitude"
                  style={{ ...labelStyle, marginBottom: '6px' }}
                >
                  Longitude
                </label>

                <input
                  id="guest-longitude"
                  type="text"
                  value={longitude}
                  readOnly
                  placeholder="Captured using GPS"
                  style={{
                    ...inputStyle,
                    padding: '11px 12px',
                    background: '#f8fafc'
                  }}
                />
              </div>
            </div>

            {gpsCaptured && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '7px',
                  marginTop: '10px',
                  color: '#15803d',
                  fontSize: '12px',
                  lineHeight: '1.5'
                }}
              >
                <CheckCircle2
                  size={16}
                  style={{ flexShrink: 0 }}
                />

                <span>
                  GPS coordinates captured successfully.
                  The address was filled automatically when available.
                </span>
              </div>
            )}

            <p
              style={{
                margin: '8px 0 0',
                fontSize: '12px',
                lineHeight: '1.6',
                color: '#64748b'
              }}
            >
              Click GPS AUTO-LINK to fill your current location
              automatically. You can also type an address manually.
            </p>
          </div>

          {/* DESCRIPTION */}

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="guest-description" style={labelStyle}>
              Describe the Problem <span style={requiredMark}>*</span>
            </label>

            <textarea
              id="guest-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the civic issue in detail..."
              rows={5}
              disabled={isSubmitting}
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px',
                border: '1px solid #cbd5e1',
                borderRadius: '9px',
                resize: 'vertical',
                fontSize: '14px',
                lineHeight: '1.6',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* IMAGE UPLOAD */}

          <div style={{ marginBottom: '22px' }}>
            <label style={labelStyle}>
              Upload Image{' '}
              <span
                style={{
                  color: '#94a3b8',
                  fontWeight: '400'
                }}
              >
                (Optional)
              </span>
            </label>

            <input
              id="guest-complaint-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isSubmitting}
              style={{ display: 'none' }}
            />

            {!imagePreview ? (
              <label
                htmlFor="guest-complaint-image"
                style={{
                  border: '1px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '26px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  background: '#f8fafc',
                  color: '#64748b',
                  textAlign: 'center'
                }}
              >
                <ImageIcon
                  size={30}
                  style={{ marginBottom: '10px' }}
                />

                <strong
                  style={{
                    color: '#334155',
                    marginBottom: '5px',
                    fontSize: '13px'
                  }}
                >
                  Click to upload image
                </strong>

                <span style={{ fontSize: '12px' }}>
                  PNG, JPG, JPEG or WEBP
                </span>

                <span
                  style={{
                    fontSize: '11px',
                    marginTop: '5px'
                  }}
                >
                  Maximum 10 MB
                </span>
              </label>
            ) : (
              <div
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '12px',
                  background: '#f8fafc'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '10px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      minWidth: 0
                    }}
                  >
                    <ImageIcon size={18} />

                    <span
                      style={{
                        fontSize: '13px',
                        color: '#334155',
                        overflowWrap: 'anywhere'
                      }}
                    >
                      {image?.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                    aria-label="Remove uploaded image"
                    style={{
                      width: '32px',
                      height: '32px',
                      flexShrink: 0,
                      border: 'none',
                      borderRadius: '8px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={17} />
                  </button>
                </div>

                <img
                  src={imagePreview}
                  alt="Complaint image preview"
                  style={{
                    width: '100%',
                    maxHeight: '280px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    background: '#ffffff'
                  }}
                />
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}

          <button
            type="submit"
            disabled={isSubmitting || isGpsLoading}
            style={{
              width: '100%',
              border: 'none',
              borderRadius: '9px',
              padding: '14px',
              background:
                isSubmitting || isGpsLoading
                  ? '#94a3b8'
                  : '#2563eb',
              color: '#ffffff',
              cursor:
                isSubmitting || isGpsLoading
                  ? 'not-allowed'
                  : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isSubmitting ? (
              <LoaderCircle size={17} />
            ) : (
              <Send size={17} />
            )}

            {isSubmitting
              ? 'Submitting Complaint...'
              : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default GuestComplaint;
