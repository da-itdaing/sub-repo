package com.da.itdaing.domain.user.repository;

import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.user.entity.UserPrefRegion;
import com.da.itdaing.domain.user.entity.Users;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserPrefRegionRepository extends JpaRepository<UserPrefRegion, Long> {

    boolean existsByUserAndRegion(Users user, Region region);

    @Query("""
        select upr
        from UserPrefRegion upr
        join fetch upr.region
        where upr.user.id = :userId
        order by upr.createdAt desc
        """)
    List<UserPrefRegion> findByUserIdWithRegion(@Param("userId") Long userId);

    List<UserPrefRegion> findAllByUser_Id(Long userId);
}


