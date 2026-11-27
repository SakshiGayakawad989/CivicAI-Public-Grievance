
package com.CivicAI.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.CivicAI.backend.entity.Complaint;
import com.CivicAI.backend.entity.Hotspot;
import com.CivicAI.backend.repository.ComplaintRepository;
import com.CivicAI.backend.repository.HotspotRepository;

@Service
public class HotspotService {

    private final ComplaintRepository complaintRepository;
    private final HotspotRepository hotspotRepository;

    private static final int MINIMUM_COMPLAINTS = 3;
    private static final double CLUSTERING_RADIUS_METERS = 100.0;

    // Used to match a saved hotspot to its recomputed cluster.
    private static final double CENTER_MATCH_TOLERANCE_METERS = 1.0;

    public HotspotService(
            ComplaintRepository complaintRepository,
            HotspotRepository hotspotRepository) {

        this.complaintRepository = complaintRepository;
        this.hotspotRepository = hotspotRepository;
    }

    /**
     * Detect geographical complaint-density hotspots using
     * DBSCAN-style clustering.
     *
     * Clustering is based only on latitude and longitude.
     * Department/category does not affect clustering.
     */
    @Transactional
    public List<Hotspot> detectHotspots() {

        List<List<Complaint>> clusters = buildClusters();

        // Remove previous hotspot records before saving refreshed results.
        hotspotRepository.deleteAll();

        List<Hotspot> hotspots = new ArrayList<>();

        for (List<Complaint> cluster : clusters) {

            Hotspot hotspot = new Hotspot();

            double totalLatitude = 0.0;
            double totalLongitude = 0.0;

            List<Long> complaintIds = new ArrayList<>();

            for (Complaint complaint : cluster) {

                totalLatitude += complaint.getLatitude();
                totalLongitude += complaint.getLongitude();

                complaintIds.add(complaint.getId());
            }

            double centerLatitude = totalLatitude / cluster.size();
            double centerLongitude = totalLongitude / cluster.size();

            hotspot.setLatitude(centerLatitude);
            hotspot.setLongitude(centerLongitude);
            hotspot.setComplaintCount((long) cluster.size());

            // Choose the most frequently used non-empty address.
            hotspot.setLocation(findMostCommonLocation(cluster));

            // Transient IDs are available in this response.
            hotspot.setComplaintIds(complaintIds);

            hotspots.add(hotspot);
        }

        return hotspotRepository.saveAll(hotspots);
    }

    /**
     * Retrieve saved hotspots and rebuild their complaint IDs.
     *
     * Complaint IDs are matched against freshly recomputed
     * clusters instead of using the center as a membership rule.
     */
    @Transactional(readOnly = true)
    public List<Hotspot> getAllHotspots() {

        List<Hotspot> hotspots = hotspotRepository.findAll();
        List<List<Complaint>> clusters = buildClusters();

        Set<Integer> matchedClusters = new HashSet<>();

        for (Hotspot hotspot : hotspots) {

            List<Long> complaintIds = new ArrayList<>();
            int matchingClusterIndex = -1;

            if (hotspot.getLatitude() != null
                    && hotspot.getLongitude() != null) {

                for (int i = 0; i < clusters.size(); i++) {

                    if (matchedClusters.contains(i)) {
                        continue;
                    }

                    List<Complaint> cluster = clusters.get(i);

                    if (hotspot.getComplaintCount() == null
                            || hotspot.getComplaintCount().longValue()
                                    != cluster.size()) {
                        continue;
                    }

                    double[] center = calculateCenter(cluster);

                    double distance = calculateDistance(
                            hotspot.getLatitude(),
                            hotspot.getLongitude(),
                            center[0],
                            center[1]
                    );

                    if (distance <= CENTER_MATCH_TOLERANCE_METERS) {
                        matchingClusterIndex = i;
                        break;
                    }
                }
            }

            if (matchingClusterIndex >= 0) {

                List<Complaint> matchedCluster =
                        clusters.get(matchingClusterIndex);

                for (Complaint complaint : matchedCluster) {
                    complaintIds.add(complaint.getId());
                }

                matchedClusters.add(matchingClusterIndex);
            }

            hotspot.setComplaintIds(complaintIds);
        }

        return hotspots;
    }

    /**
     * Build geographic clusters using DBSCAN-style expansion.
     *
     * A complaint is a core point when at least three complaints,
     * including itself, are within 100 metres.
     *
     * Previously identified noise points can become border points
     * when reached from a core point.
     */
    private List<List<Complaint>> buildClusters() {

        List<Complaint> complaints = complaintRepository.findAll();
        List<Complaint> validComplaints = new ArrayList<>();

        for (Complaint complaint : complaints) {

            if (complaint.getId() != null
                    && complaint.getLatitude() != null
                    && complaint.getLongitude() != null
                    && isValidCoordinate(
                            complaint.getLatitude(),
                            complaint.getLongitude())) {

                validComplaints.add(complaint);
            }
        }

        List<List<Complaint>> clusters = new ArrayList<>();

        Set<Long> visited = new HashSet<>();
        Set<Long> assignedToCluster = new HashSet<>();

        for (Complaint complaint : validComplaints) {

            Long complaintId = complaint.getId();

            if (visited.contains(complaintId)) {
                continue;
            }

            visited.add(complaintId);

            List<Complaint> neighbors =
                    findNeighbors(complaint, validComplaints);

            // Not a core point: it may be noise or a border point.
            if (neighbors.size() < MINIMUM_COMPLAINTS) {
                continue;
            }

            List<Complaint> cluster = new ArrayList<>();
            Set<Long> clusterIds = new HashSet<>();

            addToCluster(
                    complaint, cluster, clusterIds, assignedToCluster);

            // Expand the cluster through neighboring core points.
            List<Complaint> queue = new ArrayList<>(neighbors);
            Set<Long> queuedIds = new HashSet<>();

            for (Complaint neighbor : queue) {
                queuedIds.add(neighbor.getId());
            }

            for (int i = 0; i < queue.size(); i++) {

                Complaint current = queue.get(i);
                Long currentId = current.getId();

                if (!visited.contains(currentId)) {

                    visited.add(currentId);

                    List<Complaint> currentNeighbors =
                            findNeighbors(current, validComplaints);

                    if (currentNeighbors.size() >= MINIMUM_COMPLAINTS) {

                        for (Complaint neighbor : currentNeighbors) {

                            if (queuedIds.add(neighbor.getId())) {
                                queue.add(neighbor);
                            }
                        }
                    }
                }

                // Include unassigned points, including border points.
                if (!assignedToCluster.contains(currentId)) {

                    addToCluster(
                            current,
                            cluster,
                            clusterIds,
                            assignedToCluster
                    );
                }
            }

            if (cluster.size() >= MINIMUM_COMPLAINTS) {
                clusters.add(cluster);
            }
        }

        return clusters;
    }

    private void addToCluster(
            Complaint complaint,
            List<Complaint> cluster,
            Set<Long> clusterIds,
            Set<Long> assignedToCluster) {

        Long id = complaint.getId();

        if (clusterIds.add(id)) {
            cluster.add(complaint);
        }

        assignedToCluster.add(id);
    }

    /**
     * Find all complaints within the configured radius.
     * The complaint itself is included.
     */
    private List<Complaint> findNeighbors(
            Complaint complaint,
            List<Complaint> complaints) {

        List<Complaint> neighbors = new ArrayList<>();

        for (Complaint other : complaints) {

            double distance = calculateDistance(
                    complaint.getLatitude(),
                    complaint.getLongitude(),
                    other.getLatitude(),
                    other.getLongitude()
            );

            if (distance <= CLUSTERING_RADIUS_METERS) {
                neighbors.add(other);
            }
        }

        return neighbors;
    }

    /**
     * Select the most frequently occurring non-empty location.
     * In a tie, the first location encountered wins.
     */
    private String findMostCommonLocation(List<Complaint> cluster) {

        Map<String, Integer> counts = new HashMap<>();

        String bestLocation = "Unknown Area";
        int maximumCount = 0;

        for (Complaint complaint : cluster) {

            String location = complaint.getLocation();

            if (location == null || location.trim().isEmpty()) {
                continue;
            }

            location = location.trim();

            int count = counts.getOrDefault(location, 0) + 1;
            counts.put(location, count);

            if (count > maximumCount) {
                maximumCount = count;
                bestLocation = location;
            }
        }

        return bestLocation;
    }

    private double[] calculateCenter(List<Complaint> cluster) {

        double totalLatitude = 0.0;
        double totalLongitude = 0.0;

        for (Complaint complaint : cluster) {
            totalLatitude += complaint.getLatitude();
            totalLongitude += complaint.getLongitude();
        }

        return new double[] {
            totalLatitude / cluster.size(),
            totalLongitude / cluster.size()
        };
    }

    private boolean isValidCoordinate(
            double latitude,
            double longitude) {

        return Double.isFinite(latitude)
                && Double.isFinite(longitude)
                && latitude >= -90.0
                && latitude <= 90.0
                && longitude >= -180.0
                && longitude <= 180.0;
    }

    /**
     * Haversine formula: distance between two GPS coordinates in metres.
     */
    private double calculateDistance(
            double latitude1,
            double longitude1,
            double latitude2,
            double longitude2) {

        final double EARTH_RADIUS_METERS = 6371000.0;

        double latitudeDistance =
                Math.toRadians(latitude2 - latitude1);

        double longitudeDistance =
                Math.toRadians(longitude2 - longitude1);

        double a =
                Math.sin(latitudeDistance / 2)
                        * Math.sin(latitudeDistance / 2)
                + Math.cos(Math.toRadians(latitude1))
                        * Math.cos(Math.toRadians(latitude2))
                * Math.sin(longitudeDistance / 2)
                        * Math.sin(longitudeDistance / 2);

        // Protect against floating-point rounding errors.
        a = Math.max(0.0, Math.min(1.0, a));

        double c = 2.0 * Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1.0 - a)
        );

        return EARTH_RADIUS_METERS * c;
    }
}
