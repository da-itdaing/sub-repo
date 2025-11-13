package com.da.itdaing.domain.user.repository;

import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.user.entity.UserPrefRegion;
import com.da.itdaing.domain.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPrefRegionRepository extends JpaRepository<UserPrefRegion, Long> {

    boolean existsByUserAndRegion(Users user, Region region);
}


