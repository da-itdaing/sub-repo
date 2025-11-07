package com.da.itdaing.domain.user.repository;

import com.da.itdaing.domain.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 사용자 Repository
 */
public interface UserRepository extends JpaRepository<Users, Long> {

    /**
     * 이메일로 사용자 조회
     */
    Optional<Users> findByEmail(String email);

    Optional<Users> findByLoginId(String loginId);

    /**
     * 이메일 존재 여부 확인
     */
    boolean existsByEmail(String email);

    /**
     * 로그인 ID 존재 여부 확인
     */
    boolean existsByLoginId(String loginId);
}

