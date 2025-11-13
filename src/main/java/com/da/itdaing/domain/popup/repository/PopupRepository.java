package com.da.itdaing.domain.popup.repository;

import com.da.itdaing.domain.popup.entity.Popup;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PopupRepository extends JpaRepository<Popup, Long> {

    @Query("""
        select p from Popup p
        join fetch p.zoneCell z
        join fetch z.zoneArea
        join fetch p.seller
        """)
    List<Popup> findAllWithZoneAndSeller();

    @Query("""
        select p from Popup p
        join fetch p.zoneCell z
        join fetch z.zoneArea
        join fetch p.seller
        where p.id = :popupId
        """)
    Optional<Popup> findByIdWithZoneAndSeller(Long popupId);
}