import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';

import { initialComplaints } from '../data/complaints';
import { initialDepartments } from '../data/departments';
import { initialFeedback } from '../data/feedback';
import { initialHotspots } from '../data/hotspots';
import { initialUsers } from '../data/users';

const CivicDataContext = createContext();

const API_BASE_URL = 'http://localhost:8080/api';

// =========================================================
// GET STORED USER
// =========================================================

const getStoredUser = () => {
  try {
    const savedUser =
      localStorage.getItem('civicai_user') ||
      localStorage.getItem('civicaiUser');

    if (savedUser) {
      return JSON.parse(savedUser);
    }
  } catch (error) {
    console.error('Error reading logged-in user:', error);
  }

  return null;
};

// =========================================================
// NORMALIZE USER ID
// =========================================================

const getNumericUserId = (userId) => {
  if (
    userId === null ||
    userId === undefined ||
    userId === ''
  ) {
    return null;
  }

  const numericId = Number(userId);

  if (
    !Number.isFinite(numericId) ||
    !Number.isInteger(numericId) ||
    numericId <= 0
  ) {
    return null;
  }

  return numericId;
};

// =========================================================
// NORMALIZE COMPLAINT STATUS
// =========================================================

const normalizeComplaintStatus = (status) => {
  const rawStatus =
    typeof status === 'object' && status !== null
      ? status.status ?? status.name ?? status.value ?? ''
      : status;

  const value = String(rawStatus ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  const aliases = {
    SUBMITTED: 'SUBMITTED',
    PENDING: 'SUBMITTED',
    NEW: 'SUBMITTED',
    INPROGRESS: 'IN_PROGRESS',
    INPROCESS: 'IN_PROGRESS',
    WORKINPROGRESS: 'IN_PROGRESS',
    RESOLVED: 'RESOLVED',
    COMPLETED: 'RESOLVED',
    CLOSED: 'CLOSED',
    VERIFIED: 'CLOSED'
  };

  return aliases[value] || value;
};

// =========================================================
// NORMALIZE COMPLAINT CATEGORY
// =========================================================

const normalizeComplaintCategory = (category) => {
  const rawCategory =
    typeof category === 'object' && category !== null
      ? category.name ?? category.category ?? category.value ?? ''
      : category;

  const value = String(rawCategory ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  const aliases = {
    ROAD: 'ROADS',
    ROADS: 'ROADS',
    WATER: 'WATER',
    WATERLEAK: 'WATER',
    WATERLEAKAGE: 'WATER',
    WATERSUPPLY: 'WATER',
    SANITATION: 'SANITATION',
    ELECTRICITY: 'ELECTRICITY',
    ELECTRICAL: 'ELECTRICITY',
    DRAIN: 'DRAINAGE',
    DRAINAGE: 'DRAINAGE',
    GARBAGE: 'GARBAGE',
    WASTE: 'GARBAGE',
    WASTEMANAGEMENT: 'GARBAGE',
    STREETLIGHT: 'STREETLIGHT',
    STREETLIGHTS: 'STREETLIGHT',
    OTHER: 'OTHER'
  };

  return aliases[value] || value;
};

// =========================================================
// DEPARTMENT COMPLAINT STATISTICS
// =========================================================

const normalizeDepartmentName = (name) =>
  String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\bdepartment\b/g, '')
    .replace(/[^a-z0-9]/g, '');

const getDepartmentComplaintStats = (
  department,
  complaints
) => {
  const departmentName = normalizeDepartmentName(
    department.name
  );

  const departmentComplaints = complaints.filter(
    (complaint) => {
      const complaintDepartment =
        typeof complaint.department === 'object'
          ? complaint.department?.name
          : complaint.department;

      const complaintDepartmentId =
        complaint.departmentId ??
        (typeof complaint.department === 'object'
          ? complaint.department?.id
          : null);

      if (
        department.id != null &&
        complaintDepartmentId != null &&
        String(department.id) ===
          String(complaintDepartmentId)
      ) {
        return true;
      }

      return (
        departmentName !== '' &&
        normalizeDepartmentName(complaintDepartment) ===
          departmentName
      );
    }
  );

  const total = departmentComplaints.length;

  const resolved = departmentComplaints.filter(
    (complaint) => {
      const status = normalizeComplaintStatus(
        complaint.status
      );

      return status === 'RESOLVED' || status === 'CLOSED';
    }
  ).length;

  const pending = total - resolved;

  return {
    ...department,
    total,
    resolved,
    pending,
    sla:
      total > 0
        ? Math.round((resolved / total) * 100)
        : 0
  };
};

// =========================================================
// PROVIDER
// =========================================================

export function CivicDataProvider({ children }) {
  const [storedUser, setStoredUser] = useState(() =>
    getStoredUser()
  );

  const isSubmittingComplaint = useRef(false);

  // Prevent duplicate status updates for the same complaint.
  const updatingComplaintIds = useRef(new Set());

  const [role, setRole] = useState(
    storedUser?.role?.toLowerCase() || 'authority'
  );

  // =========================================================
  // CITIZEN PROFILE
  // =========================================================

  const [citizenProfile, setCitizenProfile] = useState(() => {
    try {
      const user = getStoredUser();

      if (user) {
        return {
          id: user.id,
          userId: user.id,
          name: user.name || 'Citizen',
          title:
            user.role?.toUpperCase() === 'AUTHORITY'
              ? 'Authority User'
              : 'Registered Resident',
          email: user.email || '',
          phone: user.phone || 'N/A',
          ward: user.ward || 'Ward 8 (Campus Sector)',
          address: user.address || '',
          city: user.city || '',
          aadhaarVerified:
            user.role?.toUpperCase() === 'CITIZEN'
        };
      }

      return {
        id: null,
        userId: null,
        name: 'Guest Resident',
        title: 'Guest Citizen (Unverified)',
        email: 'guest@civicai.local',
        phone: 'N/A',
        ward: 'Ward 8 (Campus Sector)',
        address: '',
        city: '',
        aadhaarVerified: false
      };
    } catch (error) {
      console.error('Error loading citizen profile:', error);

      return {
        id: null,
        userId: null,
        name: 'Guest Resident',
        title: 'Guest Citizen (Unverified)',
        email: 'guest@civicai.local',
        phone: 'N/A',
        ward: 'Ward 8 (Campus Sector)',
        address: '',
        city: '',
        aadhaarVerified: false
      };
    }
  });

  // =========================================================
  // UPDATE CITIZEN PROFILE
  // =========================================================

  const updateCitizenProfile = (profileData) => {
    setCitizenProfile(prev => {
      const updatedProfile = {
        ...(prev || {}),
        ...(profileData || {})
      };

      localStorage.setItem(
        'civicai_citizen_profile',
        JSON.stringify(updatedProfile)
      );

      return updatedProfile;
    });
  };

  // =========================================================
  // COMPLAINTS AND SHARED DATA
  // =========================================================

  const [complaints, setComplaints] = useState(() => {
    if (storedUser?.role?.toUpperCase() === 'CITIZEN') {
      return [];
    }

    return initialComplaints;
  });

  const [departments, setDepartments] =
    useState(initialDepartments);

  const [feedbackList, setFeedbackList] =
    useState(initialFeedback);

  const [hotspots, setHotspots] =
    useState(initialHotspots);

  const [users, setUsers] =
    useState(initialUsers);

  const [
    isDetectingHotspots,
    setIsDetectingHotspots
  ] = useState(false);

  const [toast, setToast] = useState(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Complaint #18 Assigned',
      time: '10 mins ago',
      read: false
    },
    {
      id: 2,
      title: 'Hotspot Cluster Detected',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      title: 'SLA Threshold Alert: Road Dept',
      time: '3 hours ago',
      read: true
    }
  ]);

  // =========================================================
  // GET LOGGED-IN USER
  // =========================================================

  const getLoggedInUser = () => getStoredUser();

  // =========================================================
  // SAVE USER
  // =========================================================

  const saveLoggedInUser = (user) => {
    if (!user) return;

    localStorage.setItem(
      'civicai_user',
      JSON.stringify(user)
    );

    localStorage.removeItem('civicaiUser');

    if (user.id != null) {
      localStorage.setItem(
        'civicai_userId',
        String(user.id)
      );
    }

    setStoredUser(user);

    const userRole =
      user.role?.toLowerCase() || 'authority';

    setRole(userRole);

    const profile = {
      id: user.id,
      userId: user.id,
      name: user.name || 'Citizen',
      title:
        user.role?.toUpperCase() === 'AUTHORITY'
          ? 'Authority User'
          : 'Registered Resident',
      email: user.email || '',
      phone: user.phone || 'N/A',
      ward: user.ward || 'Ward 8 (Campus Sector)',
      address: user.address || '',
      city: user.city || '',
      aadhaarVerified:
        user.role?.toUpperCase() === 'CITIZEN'
    };

    setCitizenProfile(profile);

    localStorage.setItem(
      'civicai_citizen_profile',
      JSON.stringify(profile)
    );

    setComplaints([]);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logoutUser = () => {
    localStorage.removeItem('civicai_user');
    localStorage.removeItem('civicaiUser');
    localStorage.removeItem('civicai_userId');
    localStorage.removeItem('civicai_citizen_profile');

    setStoredUser(null);

    setCitizenProfile({
      id: null,
      userId: null,
      name: 'Guest Resident',
      title: 'Guest Citizen (Unverified)',
      email: 'guest@civicai.local',
      phone: 'N/A',
      ward: 'Ward 8 (Campus Sector)',
      address: '',
      city: '',
      aadhaarVerified: false
    });

    setRole('guest');
    setComplaints([]);
  };

  // =========================================================
  // TOAST
  // =========================================================

  const showToast = (message, type = 'success') => {
    setToast({
      message,
      type,
      id: Date.now()
    });

    setTimeout(() => {
      setToast(prev =>
        prev?.message === message ? null : prev
      );
    }, 4000);
  };

  // =========================================================
  // FORMAT COMPLAINT
  // =========================================================

  const formatComplaint = (c) => {
    const departmentName =
      typeof c.department === 'object'
        ? c.department?.name
        : c.department;

    return {
      ...c,

      // Normalize status whenever API data enters the UI.
      status: normalizeComplaintStatus(c.status),

      categoryKey: normalizeComplaintCategory(c.category),

      department:
        departmentName || 'Municipal Administration',

      coordinates: {
        lat: c.latitude ?? 0,
        lng: c.longitude ?? 0
      },

      isDuplicate:
        c.duplicate ??
        c.isDuplicate ??
        false,

      photoUrl:
        c.imagePath ||
        c.photoUrl ||
        null,

      citizenId:
        c.citizenId ??
        c.userId ??
        c.citizen?.id ??
        c.user?.id ??
        null,

      citizenName:
        c.citizenName ||
        c.citizen?.name ||
        c.user?.name ||
        'Citizen',

      citizenPhone:
        c.citizenPhone ||
        c.citizen?.phone ||
        c.user?.phone ||
        '',

      timeline:
        c.timeline || [
          {
            step: 'Complaint Submitted',
            time: c.createdAt,
            completed: true
          },
          {
            step: 'AI Analysis Completed',
            time: c.createdAt,
            completed: true,
            detail: `Category: ${c.category}`
          },
          {
            step: `Assigned to ${
              departmentName || 'Department'
            }`,
            time: c.createdAt,
            completed: !!c.department
          },
          {
            step: 'Pending Department Dispatch',
            time: 'Pending stage',
            completed:
              normalizeComplaintStatus(c.status) === 'IN_PROGRESS' ||
              normalizeComplaintStatus(c.status) === 'RESOLVED'
          },
          {
            step: 'Resolution',
            time: c.resolvedAt || 'Pending stage',
            completed:
              normalizeComplaintStatus(c.status) === 'RESOLVED'
          },
          {
            step: 'Citizen Feedback',
            time: 'Pending stage',
            completed: c.citizenVerified === true
          }
        ]
    };
  };

  // =========================================================
  // MAP POSITION HELPER
  // =========================================================

  const getMapPosition = (latitude, longitude) => {
    if (
      latitude == null ||
      longitude == null ||
      latitude === '' ||
      longitude === ''
    ) {
      return {
        top: '50%',
        left: '50%'
      };
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return {
        top: '50%',
        left: '50%'
      };
    }

    const MIN_LAT = 16.165;
    const MAX_LAT = 16.190;
    const MIN_LNG = 75.645;
    const MAX_LNG = 75.710;

    let x =
      ((lng - MIN_LNG) /
        (MAX_LNG - MIN_LNG)) * 100;

    let y =
      ((MAX_LAT - lat) /
        (MAX_LAT - MIN_LAT)) * 100;

    x = Math.max(8, Math.min(92, x));
    y = Math.max(10, Math.min(85, y));

    return {
      top: `${y}%`,
      left: `${x}%`
    };
  };

  // =========================================================
  // FORMAT HOTSPOT
  // =========================================================

  const formatHotspot = (h, index = 0) => {
    const complaintCount =
      Number(h.complaintCount ?? h.reportsCount) || 0;

    const complaintIds =
      Array.isArray(h.complaintIds)
        ? h.complaintIds
        : [];

    let severity = 'LOW';

    if (complaintCount >= 10) {
      severity = 'HIGH';
    } else if (complaintCount >= 5) {
      severity = 'MEDIUM';
    }

    const severityLabel =
      severity === 'HIGH'
        ? 'HIGH DENSITY'
        : severity === 'MEDIUM'
          ? 'MEDIUM DENSITY'
          : 'LOW DENSITY';

    const areaName =
      typeof h.location === 'string' &&
      h.location.trim()
        ? h.location.trim()
        : 'Unknown Area';

    const latitude =
      h.latitude == null ? null : Number(h.latitude);

    const longitude =
      h.longitude == null ? null : Number(h.longitude);

    const validCoordinates =
      latitude !== null &&
      longitude !== null &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180;

    const category =
      typeof h.category === 'string' &&
      h.category.trim()
        ? h.category.trim().toUpperCase()
        : 'MIXED';

    return {
      ...h,

      id: h.id,
      number: index + 1,

      location: areaName,
      title: areaName,
      shortLabel: areaName,

      latitude: validCoordinates ? latitude : null,
      longitude: validCoordinates ? longitude : null,

      coordinates: validCoordinates
        ? {
            lat: latitude,
            lng: longitude
          }
        : null,

      complaintIds,
      complaintCount,
      reportsCount: complaintCount,

      category,

      severity,
      severityLabel,

      description:
        `${complaintCount} complaints detected in this area.`,

      recommendedAction:
        severity === 'HIGH'
          ? 'High complaint density. Immediate municipal attention recommended.'
          : severity === 'MEDIUM'
            ? 'Moderate complaint density. Municipal inspection recommended.'
            : 'Low complaint density. Continue monitoring this area.',

      mapPosition: validCoordinates
        ? getMapPosition(latitude, longitude)
        : {
            top: '50%',
            left: '50%'
          }
    };
  };

  // =========================================================
  // LOAD COMPLAINTS
  // =========================================================

  const loadComplaints = async (
    userId = null,
    requestedRole = null
  ) => {
    try {
      const loggedInUser = getLoggedInUser();

      const actualRole = requestedRole
        ? requestedRole.toUpperCase()
        : loggedInUser?.role?.toUpperCase();

      const rawUserId =
        userId != null ? userId : loggedInUser?.id;

      const currentUserId =
        getNumericUserId(rawUserId);

      const isCitizen = actualRole === 'CITIZEN';
      const isAuthority = actualRole === 'AUTHORITY';

      if (!isCitizen && !isAuthority) {
        setComplaints([]);
        return [];
      }

      if (isCitizen && currentUserId == null) {
        console.error('Invalid citizen user ID:', rawUserId);
        setComplaints([]);
        return [];
      }

      const apiUrl =
        isCitizen && currentUserId != null
          ? `${API_BASE_URL}/complaints?userId=${currentUserId}`
          : `${API_BASE_URL}/complaints`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(
          `Complaint API error: ${response.status}`
        );
      }

      const data = await response.json();

      let complaintData = Array.isArray(data) ? data : [];

      if (isCitizen && currentUserId != null) {
        complaintData = complaintData.filter(c => {
          const ownerId =
            c.user?.id ??
            c.citizen?.id ??
            c.userId ??
            c.citizenId ??
            null;

          if (ownerId == null) return true;

          return Number(ownerId) === Number(currentUserId);
        });
      }

      const uniqueComplaints = [];
      const seenIds = new Set();

      complaintData.forEach(c => {
        if (c?.id == null) return;

        const complaintId = String(c.id);

        if (!seenIds.has(complaintId)) {
          seenIds.add(complaintId);
          uniqueComplaints.push(c);
        }
      });

      const formattedData =
        uniqueComplaints.map(formatComplaint);

      setComplaints(formattedData);

      console.log('Loaded complaints:', formattedData);
      console.log('Complaint count:', formattedData.length);

      return formattedData;
    } catch (error) {
      console.error('Failed to load complaints:', error);
      return [];
    }
  };

  // =========================================================
  // LOAD DEPARTMENTS
  // =========================================================

  const loadDepartments = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/departments`
      );

      if (!response.ok) {
        throw new Error(
          `Department API error: ${response.status}`
        );
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setDepartments(data);
      }

      return data;
    } catch (error) {
      console.error('Failed to load departments:', error);
      return [];
    }
  };

  // =========================================================
  // LOAD HOTSPOTS
  // =========================================================

  const loadHotspots = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/hotspots`
      );

      if (!response.ok) {
        throw new Error(
          `Hotspot API error: ${response.status}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid hotspot data received.');
      }

      const formattedHotspots = data.map(
        (hotspot, index) =>
          formatHotspot(hotspot, index)
      );

      setHotspots(formattedHotspots);

      console.log('Loaded hotspots:', formattedHotspots);

      return formattedHotspots;
    } catch (error) {
      console.error('Failed to load hotspots:', error);
      return [];
    }
  };

  // =========================================================
  // DETECT HOTSPOTS
  // =========================================================

  const triggerDetectHotspots = async () => {
    if (isDetectingHotspots) return [];

    try {
      setIsDetectingHotspots(true);

      showToast(
        'Analyzing complaint locations for hotspots...',
        'info'
      );

      const response = await fetch(
        `${API_BASE_URL}/hotspots/detect`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText ||
          `Hotspot detection failed: ${response.status}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(
          'Invalid hotspot data received from server.'
        );
      }

      const formattedHotspots = data.map(
        (hotspot, index) =>
          formatHotspot(hotspot, index)
      );

      setHotspots(formattedHotspots);

      showToast(
        `${formattedHotspots.length} hotspot area${
          formattedHotspots.length === 1 ? '' : 's'
        } detected from real complaint data.`,
        'success'
      );

      console.log('Detected hotspots:', formattedHotspots);

      return formattedHotspots;
    } catch (error) {
      console.error('Hotspot detection failed:', error);

      showToast(
        `Unable to detect hotspots: ${error.message}`,
        'error'
      );

      return [];
    } finally {
      setIsDetectingHotspots(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const loggedInUser = getLoggedInUser();
    const userRole = loggedInUser?.role?.toUpperCase();

    const numericUserId = getNumericUserId(
      loggedInUser?.id
    );

    if (
      userRole === 'CITIZEN' &&
      numericUserId != null
    ) {
      setRole('citizen');
      loadComplaints(numericUserId, 'CITIZEN');
    } else if (userRole === 'AUTHORITY') {
      setRole('authority');
      loadComplaints(null, 'AUTHORITY');
    } else {
      setRole('guest');
      setComplaints([]);
    }

    loadDepartments();
    loadHotspots();
  }, []);

  // =========================================================
  // GET COMPLAINT BY ID
  // =========================================================

  const getComplaintById = (id) =>
    complaints.find(
      c => Number(c.id) === Number(id)
    ) || null;

  // =========================================================
  // ADD COMPLAINT
  // =========================================================

  const addComplaint = async (
    newComplaintData,
    userId = null
  ) => {
    if (isSubmittingComplaint.current) return null;

    isSubmittingComplaint.current = true;

    try {
      const loggedInUser = getLoggedInUser();

      const rawUserId =
        userId != null
          ? userId
          : loggedInUser?.id ?? null;

      const currentUserId = getNumericUserId(rawUserId);

      const isGuest = rawUserId == null && !loggedInUser;

      const isCitizen =
        loggedInUser?.role?.toUpperCase() === 'CITIZEN' &&
        currentUserId != null;

      const isAuthority =
        loggedInUser?.role?.toUpperCase() === 'AUTHORITY';

      if (isGuest) {
        if (!newComplaintData.title?.trim()) {
          throw new Error('Complaint title is required.');
        }

        if (!newComplaintData.location?.trim()) {
          throw new Error('Complaint location is required.');
        }

        if (!newComplaintData.description?.trim()) {
          throw new Error('Complaint description is required.');
        }

        const formData = new FormData();

        formData.append('title', newComplaintData.title.trim());
        formData.append(
          'description',
          newComplaintData.description.trim()
        );
        formData.append(
          'location',
          newComplaintData.location.trim()
        );

        let latitude = null;
        let longitude = null;

        if (navigator.geolocation) {
          try {
            const position = await new Promise(
              (resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                  resolve,
                  reject,
                  {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                  }
                );
              }
            );

            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
          } catch (gpsError) {
            console.warn('GPS unavailable:', gpsError);
          }
        }

        if (latitude !== null) {
          formData.append('latitude', String(latitude));
        }

        if (longitude !== null) {
          formData.append('longitude', String(longitude));
        }

        if (
          newComplaintData.image &&
          newComplaintData.image instanceof File
        ) {
          formData.append('image', newComplaintData.image);
        }

        const response = await fetch(
          `${API_BASE_URL}/complaints`,
          {
            method: 'POST',
            body: formData
          }
        );

        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(
            errorText ||
            `Guest complaint submission failed: ${response.status}`
          );
        }

        const savedComplaint = await response.json();

        await loadDepartments();
        await loadHotspots();

        showToast(
          `Complaint #${savedComplaint.id} submitted successfully!`,
          'success'
        );

        return formatComplaint(savedComplaint);
      }

      if (loggedInUser && currentUserId == null) {
        throw new Error(
          'Your account has an invalid user ID. Please log out and log in again.'
        );
      }

      const payload = {
        title: newComplaintData.title || 'Civic Grievance',
        description: newComplaintData.description || '',
        category: newComplaintData.category || 'OTHER',
        location:
          newComplaintData.location || 'College Road, Bagalkot',
        latitude:
          newComplaintData.latitude ??
          newComplaintData.coordinates?.lat ??
          16.1825,
        longitude:
          newComplaintData.longitude ??
          newComplaintData.coordinates?.lng ??
          75.6938,
        imagePath:
          newComplaintData.imagePath ??
          newComplaintData.photoUrl ??
          null
      };

      let apiUrl = `${API_BASE_URL}/complaints`;

      if (currentUserId != null) {
        apiUrl =
          `${API_BASE_URL}/complaints?userId=${currentUserId}`;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText || `Server returned ${response.status}`
        );
      }

      const savedComplaint = await response.json();

      const formattedSavedComplaint =
        formatComplaint(savedComplaint);

      setComplaints(prev => {
        const alreadyExists = prev.some(
          c => Number(c.id) === Number(savedComplaint.id)
        );

        return alreadyExists
          ? prev
          : [formattedSavedComplaint, ...prev];
      });

      if (isCitizen && currentUserId != null) {
        const refreshedComplaints = await loadComplaints(
          currentUserId,
          'CITIZEN'
        );

        const complaintStillExists = refreshedComplaints.some(
          c => Number(c.id) === Number(savedComplaint.id)
        );

        if (!complaintStillExists) {
          setComplaints(prev => {
            const alreadyExists = prev.some(
              c => Number(c.id) === Number(savedComplaint.id)
            );

            return alreadyExists
              ? prev
              : [formattedSavedComplaint, ...prev];
          });
        }
      } else if (isAuthority) {
        await loadComplaints(null, 'AUTHORITY');
      }

      await loadDepartments();
      await loadHotspots();

      showToast(
        `Complaint #${savedComplaint.id} submitted successfully!`,
        'success'
      );

      return formattedSavedComplaint;
    } catch (error) {
      console.error('Complaint submission failed:', error);

      showToast(
        `Complaint submission failed: ${error.message}`,
        'error'
      );

      return null;
    } finally {
      isSubmittingComplaint.current = false;
    }
  };

  // =========================================================
  // UPDATE COMPLAINT STATUS — FIXED
  // =========================================================


  // =========================================================
  // UPDATE COMPLAINT STATUS — FRONTEND STATUS FIX
  // =========================================================

  const updateComplaintStatus = async (
    id,
    newStatus,
    assignedDept = null,
    notes = ''
  ) => {
    const complaintId = Number(id);

    if (!Number.isInteger(complaintId) || complaintId <= 0) {
      showToast('Invalid complaint ID.', 'error');
      return null;
    }

    if (updatingComplaintIds.current.has(complaintId)) {
      showToast(
        'This complaint status is already being updated.',
        'info'
      );
      return null;
    }

    updatingComplaintIds.current.add(complaintId);

    try {
      const normalizedStatus =
        normalizeComplaintStatus(newStatus);

      const allowedStatuses = [
        'SUBMITTED',
        'IN_PROGRESS',
        'RESOLVED',
        'CLOSED'
      ];

      if (!allowedStatuses.includes(normalizedStatus)) {
        throw new Error(
          `Unsupported complaint status: ${normalizedStatus || '(empty)'}`
        );
      }

      const currentComplaint = complaints.find(
        complaint => Number(complaint.id) === complaintId
      );

      if (!currentComplaint) {
        throw new Error(
          'Complaint not found in the current list. Refresh the page and try again.'
        );
      }

      const currentStatus =
        normalizeComplaintStatus(currentComplaint.status);

      // Validate the complaint workflow.
      if (
        currentStatus === 'SUBMITTED' &&
        normalizedStatus !== 'IN_PROGRESS'
      ) {
        throw new Error(
          'A submitted complaint must first be moved to IN PROGRESS.'
        );
      }

      if (
        currentStatus === 'IN_PROGRESS' &&
        normalizedStatus !== 'RESOLVED'
      ) {
        throw new Error(
          'An in-progress complaint must be resolved after the work is completed.'
        );
      }

      if (
        currentStatus === 'RESOLVED' &&
        normalizedStatus !== 'CLOSED'
      ) {
        throw new Error(
          'A resolved complaint must be verified before it is closed.'
        );
      }

      // STEP 1: Update the status using the existing backend API.
      const statusUrl =
        `${API_BASE_URL}/complaints/${complaintId}/status` +
        `?status=${encodeURIComponent(normalizedStatus)}`;

      const response = await fetch(statusUrl, {
        method: 'PUT',
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText ||
          `Status update failed with HTTP ${response.status}.`
        );
      }

      // The API may return JSON or an empty response.
      const responseText = await response.text();
      let savedComplaint = {};

      if (responseText.trim()) {
        try {
          savedComplaint = JSON.parse(responseText);
        } catch {
          throw new Error(
            'The backend returned an invalid response while updating the status.'
          );
        }
      }

      const returnedStatus =
        normalizeComplaintStatus(savedComplaint.status);

      if (
        returnedStatus &&
        returnedStatus !== normalizedStatus
      ) {
        throw new Error(
          `The backend returned "${savedComplaint.status}" instead of "${normalizedStatus}".`
        );
      }

      // STEP 2: Immediately update the shared frontend state.
      const baseUpdatedComplaint = formatComplaint({
        ...currentComplaint,
        ...savedComplaint,
        id: complaintId,
        status: normalizedStatus,
        workNotes: notes || currentComplaint.workNotes || ''
      });

      setComplaints(previousComplaints =>
        previousComplaints.map(complaint =>
          Number(complaint.id) === complaintId
            ? {
                ...complaint,
                ...baseUpdatedComplaint,
                status: normalizedStatus
              }
            : complaint
        )
      );

      // STEP 3: Assign the selected department if provided.
      let departmentWarning = '';
      let updatedComplaint = { ...baseUpdatedComplaint };

      if (assignedDept != null && assignedDept !== '') {
        let departmentId = null;

        if (typeof assignedDept === 'object') {
          departmentId = assignedDept.id;
        } else {
          const matchingDepartment = departments.find(
            department =>
              String(department.id) === String(assignedDept) ||
              department.name === assignedDept
          );

          departmentId =
            matchingDepartment?.id ?? assignedDept;
        }

        if (departmentId != null && departmentId !== '') {
          try {
            const departmentResponse = await fetch(
              `${API_BASE_URL}/complaints/${complaintId}/department/${encodeURIComponent(departmentId)}`,
              {
                method: 'PUT',
                headers: {
                  Accept: 'application/json'
                }
              }
            );

            if (!departmentResponse.ok) {
              const errorText = await departmentResponse.text();

              throw new Error(
                errorText || 'Department assignment failed.'
              );
            }

            const departmentText =
              await departmentResponse.text();

            let departmentData = {};

            if (departmentText.trim()) {
              try {
                departmentData = JSON.parse(departmentText);
              } catch {
                departmentData = {};
              }
            }

            updatedComplaint = formatComplaint({
              ...updatedComplaint,
              ...departmentData,
              id: complaintId,

              // Keep the requested status in the UI.
              status: normalizedStatus
            });

            setComplaints(previousComplaints =>
              previousComplaints.map(complaint =>
                Number(complaint.id) === complaintId
                  ? {
                      ...complaint,
                      ...updatedComplaint,
                      status: normalizedStatus
                    }
                  : complaint
              )
            );
          } catch (departmentError) {
            console.error(
              'Department assignment failed:',
              departmentError
            );

            departmentWarning =
              `Status updated, but department assignment failed: ${departmentError.message}`;
          }
        }
      }

      // STEP 4: Do not reload the complaint list here.
      // The immediate frontend update above must not be overwritten
      // by a stale GET response.

      // STEP 5: Refresh department statistics only.
      await loadDepartments();

      if (departmentWarning) {
        showToast(departmentWarning, 'warning');
      } else {
        const displayStatus =
          normalizedStatus === 'IN_PROGRESS'
            ? 'In Progress'
            : normalizedStatus === 'RESOLVED'
              ? 'Resolved'
              : normalizedStatus === 'CLOSED'
                ? 'Closed'
                : 'Submitted';

        showToast(
          `Complaint #${complaintId} status updated to ${displayStatus}.`,
          'success'
        );
      }

      return {
        ...updatedComplaint,
        status: normalizedStatus
      };
    } catch (error) {
      console.error('Status update failed:', error);

      showToast(
        `Unable to update complaint: ${error.message}`,
        'error'
      );

      return null;
    } finally {
      updatingComplaintIds.current.delete(complaintId);
    }
  };


  // =========================================================
  // ADD RESOLUTION
  // =========================================================

  const addResolution = async (id, description) => {
    try {
      const cleanedDescription =
        String(description || '').trim();

      if (!cleanedDescription) {
        throw new Error('Resolution description is required.');
      }

      const response = await fetch(
        `${API_BASE_URL}/complaints/${id}/resolution?description=${encodeURIComponent(cleanedDescription)}`,
        { method: 'PUT' }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText || `Failed to add resolution: ${response.status}`
        );
      }

      const data = await response.json();
      const formatted = formatComplaint(data);

      setComplaints(prev =>
        prev.map(c =>
          Number(c.id) === Number(id) ? formatted : c
        )
      );

      showToast(
        `Resolution added to complaint #${id}.`,
        'success'
      );

      return formatted;
    } catch (error) {
      console.error('Resolution update failed:', error);

      showToast(
        `Unable to add resolution: ${error.message}`,
        'error'
      );

      return null;
    }
  };

  // =========================================================
  // COMPLETE AUTHORITY RESOLUTION FLOW
  // =========================================================

  const resolveComplaint = async (
    id,
    description,
    assignedDept = null
  ) => {
    try {
      const cleanedDescription =
        String(description || '').trim();

      if (!cleanedDescription) {
        throw new Error(
          'Please enter a resolution description.'
        );
      }

      const complaint = complaints.find(
        c => Number(c.id) === Number(id)
      );

      if (!complaint) {
        throw new Error('Complaint not found.');
      }

      if (
        normalizeComplaintStatus(complaint.status) !==
        'IN_PROGRESS'
      ) {
        throw new Error(
          'Only an IN PROGRESS complaint can be marked as RESOLVED.'
        );
      }

      const resolutionResponse = await fetch(
        `${API_BASE_URL}/complaints/${id}/resolution?description=${encodeURIComponent(cleanedDescription)}`,
        { method: 'PUT' }
      );

      if (!resolutionResponse.ok) {
        const errorText = await resolutionResponse.text();

        throw new Error(
          errorText ||
          `Resolution update failed: ${resolutionResponse.status}`
        );
      }

      const resolutionData = await resolutionResponse.json();

      const statusResponse = await fetch(
        `${API_BASE_URL}/complaints/${id}/status?status=RESOLVED`,
        { method: 'PUT' }
      );

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();

        throw new Error(
          errorText ||
          `Resolution status update failed: ${statusResponse.status}`
        );
      }

      const statusText = await statusResponse.text();

      let statusData = {};

      if (statusText.trim()) {
        try {
          statusData = JSON.parse(statusText);
        } catch {
          statusData = {};
        }
      }

      let updatedComplaint = {
        ...resolutionData,
        ...statusData,
        resolutionDescription:
          statusData.resolutionDescription ||
          resolutionData.resolutionDescription ||
          cleanedDescription,
        status: 'RESOLVED'
      };

      if (assignedDept != null && assignedDept !== '') {
        let departmentId = null;

        if (typeof assignedDept === 'object') {
          departmentId = assignedDept.id;
        } else {
          const matchingDepartment = departments.find(
            d =>
              String(d.id) === String(assignedDept) ||
              d.name === assignedDept
          );

          departmentId = matchingDepartment?.id;

          if (departmentId == null) {
            departmentId = assignedDept;
          }
        }

        if (departmentId != null) {
          const departmentResponse = await fetch(
            `${API_BASE_URL}/complaints/${id}/department/${encodeURIComponent(departmentId)}`,
            { method: 'PUT' }
          );

          if (!departmentResponse.ok) {
            const errorText = await departmentResponse.text();

            throw new Error(
              errorText || 'Department assignment failed.'
            );
          }

          const departmentText =
            await departmentResponse.text();

          let departmentData = {};

          if (departmentText.trim()) {
            try {
              departmentData = JSON.parse(departmentText);
            } catch {
              departmentData = {};
            }
          }

          updatedComplaint = {
            ...updatedComplaint,
            ...departmentData,
            resolutionDescription:
              departmentData.resolutionDescription ||
              updatedComplaint.resolutionDescription ||
              cleanedDescription,
            status: 'RESOLVED'
          };
        }
      }

      const formattedComplaint = formatComplaint({
        ...complaint,
        ...updatedComplaint,
        resolutionDescription:
          updatedComplaint.resolutionDescription ||
          cleanedDescription,
        status: 'RESOLVED'
      });

      setComplaints(prev =>
        prev.map(c =>
          Number(c.id) === Number(id)
            ? {
                ...c,
                ...formattedComplaint,
                status: 'RESOLVED'
              }
            : c
        )
      );

      showToast(
        `Complaint #${id} marked as RESOLVED.`,
        'success'
      );

      return formattedComplaint;
    } catch (error) {
      console.error('Resolve complaint failed:', error);

      showToast(
        `Unable to resolve complaint: ${error.message}`,
        'error'
      );

      return null;
    }
  };

  // =========================================================
  // VERIFY RESOLUTION
  // =========================================================

  const verifyResolution = async (id, verified) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/complaints/${id}/verify?verified=${verified}`,
        { method: 'PUT' }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText || `Verification failed: ${response.status}`
        );
      }

      const data = await response.json();
      const formatted = formatComplaint(data);

      setComplaints(prev =>
        prev.map(c =>
          Number(c.id) === Number(id) ? formatted : c
        )
      );

      showToast(
        verified
          ? 'Resolution verified successfully.'
          : 'Resolution rejected. Complaint reopened.',
        verified ? 'success' : 'info'
      );

      return formatted;
    } catch (error) {
      console.error('Verification failed:', error);

      showToast(
        `Unable to verify resolution: ${error.message}`,
        'error'
      );

      return null;
    }
  };

  // =========================================================
  // ADD IMAGE
  // =========================================================

  const addImageToComplaint = async (
    complaintId,
    imagePath
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/complaints/${complaintId}/image?imagePath=${encodeURIComponent(imagePath)}`,
        { method: 'PUT' }
      );

      if (!response.ok) {
        throw new Error('Image update failed');
      }

      const data = await response.json();
      const formatted = formatComplaint(data);

      setComplaints(prev =>
        prev.map(c =>
          Number(c.id) === Number(complaintId) ? formatted : c
        )
      );

      showToast(
        'Complaint image updated successfully.',
        'success'
      );

      return formatted;
    } catch (error) {
      showToast(
        `Unable to update image: ${error.message}`,
        'error'
      );

      return null;
    }
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const getStatistics = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/complaints/statistics`
      );

      if (!response.ok) {
        throw new Error('Failed to load statistics');
      }

      return await response.json();
    } catch (error) {
      console.error('Statistics error:', error);
      return null;
    }
  };

  // =========================================================
  // FEEDBACK
  // =========================================================

  const addFeedback = async ({
    complaintId,
    rating,
    satisfaction,
    comment
  }) => {
    const complaint = complaints.find(
      c => Number(c.id) === Number(complaintId)
    );

    const now = new Date()
      .toISOString()
      .replace('T', ' ')
      .slice(0, 16);

    const loggedInUser = getLoggedInUser();

    const newFb = {
      id: `fb-${Date.now()}`,
      complaintId: Number(complaintId),
      complaintTitle: complaint
        ? complaint.title
        : 'Civic Complaint',
      citizen: loggedInUser?.name || 'Citizen',
      rating: Number(rating) || 0,
      satisfaction: satisfaction || 'Satisfied',
      comment: comment || '',
      date: now
    };

    setFeedbackList(prev => [...prev, newFb]);

    showToast(
      'Thank you! Your feedback has been recorded.',
      'success'
    );

    return newFb;
  };

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  const markNotificationRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        Number(notification.id) === Number(id)
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({
        ...notification,
        read: true
      }))
    );
  };

  // =========================================================
  // CONTEXT VALUE
  // =========================================================

  const contextValue = {
    role,
    setRole,

    citizenProfile,
    setCitizenProfile,
    updateCitizenProfile,

    storedUser,
    setStoredUser,

    saveLoggedInUser,
    getLoggedInUser,
    logoutUser,

    complaints,
    setComplaints,
    normalizeComplaintCategory,

    departments: departments.map((department) =>
      getDepartmentComplaintStats(department, complaints)
    ),
    setDepartments,

    feedbackList,
    setFeedbackList,

    hotspots,
    setHotspots,

    users,
    setUsers,

    notifications,
    setNotifications,

    toast,
    setToast,

    isDetectingHotspots,
    setIsDetectingHotspots,

    showToast,

    loadComplaints,
    loadDepartments,

    loadHotspots,
    triggerDetectHotspots,

    getComplaintById,

    addComplaint,
    updateComplaintStatus,
    addResolution,
    resolveComplaint,
    verifyResolution,
    addImageToComplaint,

    getStatistics,

    addFeedback,

    markNotificationRead,
    markAllNotificationsRead
  };

  return (
    <CivicDataContext.Provider value={contextValue}>
      {children}
    </CivicDataContext.Provider>
  );
}

// =========================================================
// USE CONTEXT
// =========================================================

export function useCivicData() {
  const context = useContext(CivicDataContext);

  if (!context) {
    throw new Error(
      'useCivicData must be used inside CivicDataProvider'
    );
  }

  return context;
}

export default CivicDataContext;