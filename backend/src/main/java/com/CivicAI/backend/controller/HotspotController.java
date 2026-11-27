package com.CivicAI.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.CivicAI.backend.entity.Hotspot;
import com.CivicAI.backend.service.HotspotService;

@RestController
@RequestMapping("/api/hotspots")
public class HotspotController {

    private final HotspotService hotspotService;

    public HotspotController(HotspotService hotspotService) {
        this.hotspotService = hotspotService;
    }

    /**
     * Detect new geographical complaint hotspots.
     *
     * POST:
     * /api/hotspots/detect
     */
    @PostMapping("/detect")
    public ResponseEntity<List<Hotspot>> detectHotspots() {

        List<Hotspot> hotspots =
                hotspotService.detectHotspots();

        return ResponseEntity.ok(hotspots);
    }

    /**
     * Get all currently detected hotspots.
     *
     * GET:
     * /api/hotspots
     *
     * The response also contains complaintIds
     * belonging to each geographical hotspot.
     */
    @GetMapping
    public ResponseEntity<List<Hotspot>> getAllHotspots() {

        List<Hotspot> hotspots =
                hotspotService.getAllHotspots();

        return ResponseEntity.ok(hotspots);
    }
}