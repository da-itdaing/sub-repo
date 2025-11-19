package com.da.itdaing.domain.user.repository;

import com.da.itdaing.domain.master.entity.Style;
import com.da.itdaing.domain.user.entity.UserPrefStyle;
import com.da.itdaing.domain.user.entity.Users;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserPrefStyleRepository extends JpaRepository<UserPrefStyle, Long> {

    boolean existsByUserAndStyle(Users user, Style style);

    @Query("""
        select ups
        from UserPrefStyle ups
        join fetch ups.style
        where ups.user.id = :userId
        order by ups.createdAt desc
        """)
    List<UserPrefStyle> findByUserIdWithStyle(@Param("userId") Long userId);
}
