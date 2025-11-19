package com.da.itdaing.domain.user.repository;

import com.da.itdaing.domain.user.entity.UserPrefFeature;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserPrefFeatureRepository extends JpaRepository<UserPrefFeature, Long> {
    boolean existsByUserIdAndFeatureId(Long userId, Long featureId);

    long countByUserId(Long userId);

    @Query("""
        select upf
        from UserPrefFeature upf
        join fetch upf.feature
        where upf.user.id = :userId
        order by upf.createdAt desc
        """)
    List<UserPrefFeature> findByUserIdWithFeature(@Param("userId") Long userId);

    List<UserPrefFeature> findAllByUser_Id(Long userId);
}
