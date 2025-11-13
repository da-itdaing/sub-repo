package com.da.itdaing.domain.user.repository;

import com.da.itdaing.domain.master.entity.Style;
import com.da.itdaing.domain.user.entity.UserPrefStyle;
import com.da.itdaing.domain.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPrefStyleRepository extends JpaRepository<UserPrefStyle, Long> {

    boolean existsByUserAndStyle(Users user, Style style);
}
