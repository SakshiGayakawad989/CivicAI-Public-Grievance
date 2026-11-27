
package com.CivicAI.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.CivicAI.backend.entity.Hotspot;

@Repository
public interface HotspotRepository extends JpaRepository<Hotspot, Long> {
}
