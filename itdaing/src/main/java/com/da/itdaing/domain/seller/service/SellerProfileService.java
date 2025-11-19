// src/main/java/com/da/itdaing/domain/user/service/SellerProfileService.java
package com.da.itdaing.domain.seller.service;

import com.da.itdaing.domain.file.dto.ImagePayload;
import com.da.itdaing.domain.file.service.DefaultImageProvider;
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
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class SellerProfileService {

    private final SellerProfileRepository sellerProfileRepository;
    private final UserRepository userRepository;
    private final DefaultImageProvider defaultImageProvider;

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
                .profileImage(ImagePayload.builder()
                    .url(p.getProfileImageUrl())
                    .key(p.getProfileImageKey())
                    .build())
                .introduction(p.getIntroduction())
                .activityRegion(p.getActivityRegion())
                .snsUrl(p.getSnsUrl())
                .build())
            .orElseGet(() -> SellerProfileResponse.builder()
                .userId(userId)
                .email(user.getEmail())
                .exists(false)
                .profileImage(null)
                .introduction(null)
                .activityRegion(null)
                .snsUrl(null)
                .build());
    }

    @Transactional
    public SellerProfileResponse upsertMyProfile(Long userId, SellerProfileRequest req) {
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ImagePayload resolvedImage = resolveProfileImage(req.getProfileImage());

        SellerProfile profile = sellerProfileRepository.findByUserId(userId)
            .map(p -> {
                p.update(
                    resolvedImage != null ? resolvedImage.url() : null,
                    resolvedImage != null ? resolvedImage.key() : null,
                    req.getIntroduction(),
                    req.getActivityRegion(),
                    req.getSnsUrl(),
                    null,
                    null);
                return p;
            })
            .orElseGet(() -> SellerProfile.builder()
                .user(user)
                .profileImageUrl(resolvedImage != null ? resolvedImage.url() : null)
                .profileImageKey(resolvedImage != null ? resolvedImage.key() : null)
                .introduction(req.getIntroduction())
                .activityRegion(req.getActivityRegion())
                .snsUrl(req.getSnsUrl())
                .category(null)
                .contactPhone(null)
                .build());

        SellerProfile saved = sellerProfileRepository.save(profile);

        return SellerProfileResponse.builder()
            .userId(userId)
            .email(user.getEmail())
            .exists(true)
            .profileImage(ImagePayload.builder()
                .url(saved.getProfileImageUrl())
                .key(saved.getProfileImageKey())
                .build())
            .introduction(saved.getIntroduction())
            .activityRegion(saved.getActivityRegion())
            .snsUrl(saved.getSnsUrl())
            .build();
    }

    private ImagePayload resolveProfileImage(ImagePayload requested) {
        if (requested != null && StringUtils.hasText(requested.url())) {
            return requested;
        }
        return defaultImageProvider.firstOrNull();
    }
}
