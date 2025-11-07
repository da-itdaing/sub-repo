package com.da.itdaing.domain.user.repository;

import com.da.itdaing.domain.user.entity.UserPrefFeature;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPrefFeatureRepository extends JpaRepository<UserPrefFeature, Long> {
    boolean existsByUserIdAndFeatureId(Long userId, Long featureId);

    long countByUserId(Long userId);
}
