package com.da.itdaing.domain.user.repository;

import com.da.itdaing.domain.master.entity.Category;
import com.da.itdaing.domain.user.entity.UserPrefCategory;
import com.da.itdaing.domain.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPrefCategoryRepository extends JpaRepository<UserPrefCategory, Long> {

    boolean existsByUserAndCategory(Users user, Category category);
}

