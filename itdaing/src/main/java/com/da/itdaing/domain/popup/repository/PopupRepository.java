package com.da.itdaing.domain.popup.repository;

import com.da.itdaing.domain.common.enums.ApprovalStatus;
import com.da.itdaing.domain.popup.entity.Popup;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
    Optional<Popup> findByIdWithZoneAndSeller(@Param("popupId") Long popupId);

    @Query("""
        select p from Popup p
        join fetch p.zoneCell z
        join fetch z.zoneArea
        join fetch p.seller
        where p.seller.id = :sellerId
        order by p.createdAt desc
        """)
    List<Popup> findAllBySellerIdWithZoneAndSeller(@Param("sellerId") Long sellerId);

    Page<Popup> findByApprovalStatus(ApprovalStatus status, Pageable pageable);

    List<Popup> findTop8ByApprovalStatusOrderByViewCountDesc(ApprovalStatus status);
}
