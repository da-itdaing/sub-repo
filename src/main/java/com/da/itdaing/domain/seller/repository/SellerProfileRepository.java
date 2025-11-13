package com.da.itdaing.domain.seller.repository;

import com.da.itdaing.domain.seller.entity.SellerProfile;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SellerProfileRepository extends JpaRepository<SellerProfile, Long> {
    Optional<SellerProfile> findByUserId(Long userId);

    List<SellerProfile> findByUserIdIn(Collection<Long> userIds);
}