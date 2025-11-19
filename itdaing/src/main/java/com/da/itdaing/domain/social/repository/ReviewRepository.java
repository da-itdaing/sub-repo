package com.da.itdaing.domain.social.repository;

import com.da.itdaing.domain.social.entity.Review;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByPopupIdIn(Collection<Long> popupIds);

    @Query("""
        select r from Review r
        join fetch r.popup
        join fetch r.consumer
        where r.popup.id in :popupIds
        order by r.createdAt desc
        """)
    List<Review> findByPopupIdInWithRelations(@Param("popupIds") Collection<Long> popupIds);

    @Query("""
        select r from Review r
        join fetch r.popup
        join fetch r.consumer
        where r.popup.id = :popupId
        order by r.createdAt desc
        """)
    List<Review> findByPopupIdWithRelations(@Param("popupId") Long popupId);

    @Query("""
        select r from Review r
        join fetch r.popup
        join fetch r.consumer
        order by r.createdAt desc
        """)
    List<Review> findAllWithRelations();

    List<Review> findByPopupId(Long popupId);

    @Query("select r from Review r "
        + "join fetch r.popup "
        + "join fetch r.consumer "
        + "where r.id = :reviewId")
    Optional<Review> findByIdWithRelations(@Param("reviewId") Long reviewId);

    long countByConsumer_Id(Long consumerId);
}
