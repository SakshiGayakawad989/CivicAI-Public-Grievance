export const initialComplaints = [
  {
    id: 18,
    title: "broken streetlight",
    description: "broken streetlight near basaveshwar engg college, bagalkot. The entire street is completely dark after 7 PM causing safety hazards for students.",
    category: "ELECTRICITY",
    priority: "MEDIUM",
    department: "Electricity Department",
    location: "College Road, near BVVS Campus, Bagalkot",
    coordinates: { lat: 16.1825, lng: 75.6938 },
    status: "SUBMITTED",
    createdAt: "2026-08-19 17:40",
    isDuplicate: true,
    duplicateOf: 11,
    photoUrl: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80",
    aiScores: {
      categoryAccuracy: 95,
      priorityScore: 94,
      deptMatch: 97
    },
    timeline: [
      { step: "Complaint Submitted", time: "2026-08-19 17:40", completed: true },
      { step: "AI Analysis Completed", time: "2026-08-19 17:40", completed: true, detail: "Category: ELECTRICITY" },
      { step: "Assigned to Electricity Department", time: "2026-08-19 17:48", completed: true },
      { step: "Pending Department Dispatch", time: "Pending stage", completed: false },
      { step: "Resolution", time: "Pending stage", completed: false },
      { step: "Citizen Feedback", time: "Pending stage", completed: false }
    ],
    citizenName: "Rahul Sharma",
    citizenPhone: "+91 98765 43210"
  },
  {
    id: 17,
    title: "Fallen Tree Branch Blocking Lane",
    description: "Large heavy branch fell during evening storm, obstructing pedestrian walkway and narrow vehicle lane.",
    category: "OTHER",
    priority: "LOW",
    department: "Parks & Horticulture",
    location: "Gini Nagar 3rd Cross, Bagalkot",
    coordinates: { lat: 16.1750, lng: 75.6890 },
    status: "RESOLVED",
    createdAt: "2026-08-13 18:00",
    isDuplicate: false,
    duplicateOf: null,
    photoUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=800&q=80",
    aiScores: {
      categoryAccuracy: 93,
      priorityScore: 91,
      deptMatch: 96
    },
    timeline: [
      { step: "Complaint Submitted", time: "2026-08-13 18:00", completed: true },
      { step: "AI Analysis Completed", time: "2026-08-13 18:00", completed: true },
      { step: "Assigned to Parks & Horticulture", time: "2026-08-13 18:15", completed: true },
      { step: "Department Crew Dispatched", time: "2026-08-14 09:00", completed: true },
      { step: "Resolution Completed", time: "2026-08-14 14:30", completed: true },
      { step: "Citizen Feedback Received", time: "2026-08-14 18:00", completed: true }
    ],
    citizenName: "Rahul Sharma",
    citizenPhone: "+91 98765 43210"
  },
  {
    id: 16,
    title: "Open Drainage Cover near Primary School",
    description: "A concrete drainage slab has broken completely right outside the school gates. Severe risk of children falling in during rush hours.",
    category: "SANITATION",
    priority: "HIGH",
    department: "Sanitation Department",
    location: "School Road, Ward 7, Bagalkot",
    coordinates: { lat: 16.1882, lng: 75.7011 },
    status: "IN PROGRESS",
    createdAt: "2026-08-16 11:20",
    isDuplicate: false,
    duplicateOf: null,
    photoUrl: "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=800&q=80",
    aiScores: {
      categoryAccuracy: 98,
      priorityScore: 96,
      deptMatch: 99
    },
    timeline: [
      { step: "Complaint Submitted", time: "2026-08-16 11:20", completed: true },
      { step: "AI Analysis Completed", time: "2026-08-16 11:20", completed: true },
      { step: "Assigned to Sanitation Department", time: "2026-08-16 11:25", completed: true },
      { step: "Emergency Crew Deployed", time: "2026-08-16 13:00", completed: true },
      { step: "New Slab Fitting in Progress", time: "2026-08-16 15:45", completed: true },
      { step: "Citizen Feedback", time: "Pending stage", completed: false }
    ],
    citizenName: "Sunil Patil",
    citizenPhone: "+91 98451 12345"
  },
  {
    id: 15,
    title: "Drinking Water Pipeline Leakage",
    description: "Main municipal fresh water supply pipeline cracked. Potable water is flooding the street and creating low water pressure in adjacent homes.",
    category: "WATER",
    priority: "HIGH",
    department: "Water Department",
    location: "Ward 12, Vidyanagar, Bagalkot",
    coordinates: { lat: 16.1910, lng: 75.6845 },
    status: "SUBMITTED",
    createdAt: "2026-08-17 09:15",
    isDuplicate: false,
    duplicateOf: null,
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=800&q=80",
    aiScores: {
      categoryAccuracy: 97,
      priorityScore: 95,
      deptMatch: 98
    },
    timeline: [
      { step: "Complaint Submitted", time: "2026-08-17 09:15", completed: true },
      { step: "AI Analysis Completed", time: "2026-08-17 09:15", completed: true },
      { step: "Assigned to Water Department", time: "2026-08-17 09:22", completed: true },
      { step: "Inspection Team Dispatched", time: "Pending stage", completed: false },
      { step: "Pipe Replacement", time: "Pending stage", completed: false },
      { step: "Citizen Feedback", time: "Pending stage", completed: false }
    ],
    citizenName: "Anand Desai",
    citizenPhone: "+91 97412 88990"
  },
  {
    id: 14,
    title: "Pothole near Station Road Railway Gate",
    description: "Deep pothole right after the railway level crossing creating traffic jams and scooter accidents.",
    category: "ROAD",
    priority: "HIGH",
    department: "Road Department",
    location: "Station Road Bridge, Bagalkot",
    coordinates: { lat: 16.1795, lng: 75.7055 },
    status: "SUBMITTED",
    createdAt: "2026-08-18 14:30",
    isDuplicate: true,
    duplicateOf: 13,
    photoUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    aiScores: {
      categoryAccuracy: 99,
      priorityScore: 92,
      deptMatch: 98
    },
    timeline: [
      { step: "Complaint Submitted", time: "2026-08-18 14:30", completed: true },
      { step: "AI Duplicate Clustered with #13", time: "2026-08-18 14:30", completed: true },
      { step: "Assigned to Road Department", time: "2026-08-18 14:35", completed: true },
      { step: "Road Squad Scheduled", time: "Pending stage", completed: false },
      { step: "Resurfacing", time: "Pending stage", completed: false },
      { step: "Citizen Feedback", time: "Pending stage", completed: false }
    ],
    citizenName: "Deepak Joshi",
    citizenPhone: "+91 99001 55443"
  },
  {
    id: 13,
    title: "Dangerous Pothole on Station Road Bridge",
    description: "Extremely large pothole with exposed rebar on the bridge ascending slope. Vehicles are swerving into opposing lanes.",
    category: "ROAD",
    priority: "HIGH",
    department: "Road Department",
    location: "Station Road Bridge, Bagalkot",
    coordinates: { lat: 16.1798, lng: 75.7058 },
    status: "IN PROGRESS",
    createdAt: "2026-08-18 08:20",
    isDuplicate: false,
    duplicateOf: null,
    photoUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    aiScores: {
      categoryAccuracy: 99,
      priorityScore: 97,
      deptMatch: 99
    },
    timeline: [
      { step: "Complaint Submitted", time: "2026-08-18 08:20", completed: true },
      { step: "AI Priority Elevated to HIGH", time: "2026-08-18 08:20", completed: true },
      { step: "Assigned to Road Department", time: "2026-08-18 08:25", completed: true },
      { step: "Work Order Issued #WO-882", time: "2026-08-18 10:15", completed: true },
      { step: "Patching Crew on Site", time: "2026-08-18 14:00", completed: true },
      { step: "Citizen Feedback", time: "Pending stage", completed: false }
    ],
    citizenName: "Ramesh Kumar",
    citizenPhone: "+91 98800 11223"
  },
  {
    id: 12,
    title: "Garbage Overflow at Vegetable Market",
    description: "Commercial vegetable dump overflowing for 3 consecutive days. Foul odor and stray cattle obstructing vehicular access.",
    category: "SANITATION",
    priority: "HIGH",
    department: "Sanitation Department",
    location: "Main Market Road, Sector 3, Bagalkot",
    coordinates: { lat: 16.1850, lng: 75.6980 },
    status: "RESOLVED",
    createdAt: "2026-08-16 10:20",
    isDuplicate: false,
    duplicateOf: null,
    photoUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    aiScores: {
      categoryAccuracy: 96,
      priorityScore: 95,
      deptMatch: 98
    },
    timeline: [
      { step: "Complaint Submitted", time: "2026-08-16 10:20", completed: true },
      { step: "AI Analysis Completed", time: "2026-08-16 10:20", completed: true },
      { step: "Assigned to Sanitation Department", time: "2026-08-16 10:25", completed: true },
      { step: "Sanitation Squad Dispatched", time: "2026-08-16 11:30", completed: true },
      { step: "Waste Cleared & Disinfected", time: "2026-08-16 14:15", completed: true },
      { step: "Citizen Feedback Completed", time: "2026-08-16 16:30", completed: true }
    ],
    citizenName: "Priya Patel",
    citizenPhone: "+91 94480 33221"
  },
  {
    id: 11,
    title: "Broken Streetlight on College Road",
    description: "Master ticket for non-functioning streetlights along the 500-meter stretch of BVVS Campus road.",
    category: "ELECTRICITY",
    priority: "MEDIUM",
    department: "Electricity Department",
    location: "College Road, near BVVS Campus, Bagalkot",
    coordinates: { lat: 16.1822, lng: 75.6935 },
    status: "IN PROGRESS",
    createdAt: "2026-08-19 16:10",
    isDuplicate: false,
    duplicateOf: null,
    photoUrl: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80",
    aiScores: {
      categoryAccuracy: 96,
      priorityScore: 92,
      deptMatch: 97
    },
    timeline: [
      { step: "Complaint Submitted", time: "2026-08-19 16:10", completed: true },
      { step: "AI Analysis & Hotspot Grouping", time: "2026-08-19 16:10", completed: true },
      { step: "Assigned to Electricity Department", time: "2026-08-19 16:20", completed: true },
      { step: "Line Inspector Assigned", time: "2026-08-19 17:00", completed: true },
      { step: "Fixture Replacement Scheduled", time: "2026-08-19 18:30", completed: true },
      { step: "Citizen Feedback", time: "Pending stage", completed: false }
    ],
    citizenName: "Kavita Rao",
    citizenPhone: "+91 98450 77665"
  }
];
