export const initialUsers = {
  authority: {
    id: 1,
    name: "Dr. S. B. Kulkarni",
    role: "AUTHORITY",
    title: "Municipal Commissioner",
    badge: "Government Officer Portal",
    sidebarSubtitle: "AUTHORITY ENGINE",
    avatarInitial: "D",
    avatarColor: "#1677F0",
    email: "sb.kulkarni@bagalkotcmc.gov.in",
    phone: "+91 (08354) 220033",
    department: "Bagalkot City Municipal Corporation",
    officeLocation:
      "CMC Administrative Complex, Station Road, Bagalkot - 587101",
    zone: "Central Zone (Wards 1-35)",
    employeeId: "CMC-IAS-2018-042"
  },

  citizen: {
    id: 1,
    name: "Rahul Sharma",
    role: "CITIZEN",
    title: "Verified Resident",
    badge: "Citizen Portal",
    avatarInitial: "RS",
    avatarColor: "#20D4D0",
    email: "rahul.sharma@gmail.com",
    phone: "+91 98765 43210",
    address: "House #42, College Road, Near BVVS Campus",
    ward: "Ward 8 (Campus Sector)",
    city: "Bagalkot, Karnataka - 587102",
    aadhaarVerified: true,

    notifications: {
      smsAlerts: true,
      emailUpdates: true,
      aiDeduplicationNotices: true,
      slaReminders: true
    }
  }
};