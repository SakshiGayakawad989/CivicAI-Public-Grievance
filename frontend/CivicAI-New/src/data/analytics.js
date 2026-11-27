export const analyticsData = {
  overviewMetrics: {
    totalComplaints: 138,
    submittedCount: 28,
    inProgressCount: 42,
    resolvedCount: 68,
    avgResolutionTimeHours: 19.8,
    slaComplianceRate: 94.2,
    aiClassificationAccuracy: 95.8,
    duplicateDetectionRate: 98.4,
    citizenSatisfactionRating: 4.5
  },
  categoryBreakdown: [
    { category: "Sanitation", count: 42, percentage: 30.4, color: "#10B981" },
    { category: "Roads & Infrastructure", count: 35, percentage: 25.4, color: "#EF4444" },
    { category: "Electricity & Lighting", count: 28, percentage: 20.3, color: "#F59E0B" },
    { category: "Water Supply & Sewage", count: 21, percentage: 15.2, color: "#3B82F6" },
    { category: "Parks & Horticulture", count: 12, percentage: 8.7, color: "#8B5CF6" }
  ],
  monthlyTrend: [
    { month: "Mar", submitted: 24, resolved: 20 },
    { month: "Apr", submitted: 30, resolved: 28 },
    { month: "May", submitted: 38, resolved: 34 },
    { month: "Jun", submitted: 45, resolved: 41 },
    { month: "Jul", submitted: 52, resolved: 48 },
    { month: "Aug", submitted: 60, resolved: 58 }
  ],
  wardPerformance: [
    { ward: "Ward 8 (Campus Sector)", complaints: 24, sla: 96, resolved: 20 },
    { ward: "Ward 14 (Station Area)", complaints: 32, sla: 88, resolved: 24 },
    { ward: "Ward 3 (Market Central)", complaints: 29, sla: 91, resolved: 25 },
    { ward: "Ward 7 (Primary School)", complaints: 18, sla: 94, resolved: 16 },
    { ward: "Ward 12 (Vidyanagar)", complaints: 22, sla: 95, resolved: 19 }
  ],
  aiMetrics: {
    avgInferenceTimeMs: 180,
    duplicateSavingsHours: 340,
    autoRoutedPercentage: 97.4,
    escalationPreventionRate: 92.1
  }
};
