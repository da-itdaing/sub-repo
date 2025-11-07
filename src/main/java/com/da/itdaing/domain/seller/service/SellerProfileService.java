// src/main/java/com/da/itdaing/domain/user/service/SellerProfileService.java
package com.da.itdaing.domain.seller.service;

import com.da.itdaing.domain.common.enums.UserRole;   // ✅ enum import
import com.da.itdaing.domain.seller.entity.SellerProfile;
import com.da.itdaing.domain.seller.repository.SellerProfileRepository;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.seller.dto.SellerProfileRequest;
import com.da.itdaing.domain.seller.dto.SellerProfileResponse;
import com.da.itdaing.global.error.ErrorCode;
import com.da.itdaing.global.error.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SellerProfileService {

    private final SellerProfileRepository sellerProfileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public SellerProfileResponse getMyProfile(Long userId) {
        // (선택) 권한/유효성 체크: user가 SELLER인지 확인
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        return sellerProfileRepository.findByUserId(userId)
            .map(p -> SellerProfileResponse.builder()
                .userId(userId)
                .email(user.getEmail())
                .exists(true)
                .profileImageUrl(p.getProfileImageUrl())
                .introduction(p.getIntroduction())
                .activityRegion(p.getActivityRegion())
                .snsUrl(p.getSnsUrl())
                .build())
            .orElseGet(() -> SellerProfileResponse.builder()
                .userId(userId)
                .email(user.getEmail())
                .exists(false)
                .profileImageUrl(null)
                .introduction(null)
                .activityRegion(null)
                .snsUrl(null)
                .build());
    }

    @Transactional
    public SellerProfileResponse upsertMyProfile(Long userId, SellerProfileRequest req) {
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        SellerProfile profile = sellerProfileRepository.findByUserId(userId)
            .map(p -> {
                p.update(req.getProfileImageUrl(), req.getIntroduction(),
                    req.getActivityRegion(), req.getSnsUrl());
                return p;
            })
            .orElseGet(() -> SellerProfile.builder()
                .user(user)
                .profileImageUrl(req.getProfileImageUrl())
                .introduction(req.getIntroduction())
                .activityRegion(req.getActivityRegion())
                .snsUrl(req.getSnsUrl())
                .build());

        SellerProfile saved = sellerProfileRepository.save(profile);

        return SellerProfileResponse.builder()
            .userId(userId)
            .email(user.getEmail())
            .exists(true)
            .profileImageUrl(saved.getProfileImageUrl())
            .introduction(saved.getIntroduction())
            .activityRegion(saved.getActivityRegion())
            .snsUrl(saved.getSnsUrl())
            .build();
    }
}
