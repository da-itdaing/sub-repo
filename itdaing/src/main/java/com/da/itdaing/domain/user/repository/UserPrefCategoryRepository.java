package com.da.itdaing.domain.user.repository;

import com.da.itdaing.domain.master.entity.Category;
import com.da.itdaing.domain.user.entity.UserPrefCategory;
import com.da.itdaing.domain.user.entity.Users;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserPrefCategoryRepository extends JpaRepository<UserPrefCategory, Long> {

    boolean existsByUserAndCategory(Users user, Category category);

    @Query("""
        select upc
        from UserPrefCategory upc
        join fetch upc.category
        where upc.user.id = :userId
        order by upc.createdAt desc
        """)
    List<UserPrefCategory> findByUserIdWithCategory(@Param("userId") Long userId);
}

