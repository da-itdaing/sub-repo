package com.da.itdaing.domain.seller.service;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.seller.dto.SellerSummaryResponse;
import com.da.itdaing.domain.seller.entity.SellerProfile;
import com.da.itdaing.domain.seller.exception.SellerNotFoundException;
import com.da.itdaing.domain.seller.repository.SellerProfileRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class SellerQueryService {

    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;

    public List<SellerSummaryResponse> getSellers() {
        List<Users> sellers = userRepository.findByRole(UserRole.SELLER);
        if (sellers.isEmpty()) {
            return List.of();
        }
        Map<Long, SellerProfile> profileMap = loadProfiles(sellers);
        return sellers.stream()
            .map(user -> toSummaryResponse(user, profileMap.get(user.getId())))
            .toList();
    }

    public SellerSummaryResponse getSeller(Long sellerId) {
        Users user = userRepository.findById(sellerId)
            .filter(u -> u.getRole() == UserRole.SELLER)
            .orElseThrow(() -> new SellerNotFoundException(sellerId));
        SellerProfile profile = sellerProfileRepository.findByUserId(user.getId()).orElse(null);
        return toSummaryResponse(user, profile);
    }

    private Map<Long, SellerProfile> loadProfiles(List<Users> sellers) {
        List<Long> sellerIds = sellers.stream().map(Users::getId).toList();
        return sellerProfileRepository.findByUserIdIn(sellerIds)
            .stream()
            .collect(Collectors.toMap(SellerProfile::getUserId, profile -> profile));
    }

    private SellerSummaryResponse toSummaryResponse(Users user, SellerProfile profile) {
        String name = resolveName(user);
        String description = profile != null ? profile.getIntroduction() : null;
        String profileImageUrl = profile != null ? profile.getProfileImageUrl() : null;
        String mainArea = profile != null ? profile.getActivityRegion() : null;
        String snsUrl = profile != null ? profile.getSnsUrl() : null;
        String email = user.getEmail();
        String phone = profile != null ? profile.getContactPhone() : null;
        String category = profile != null ? profile.getCategory() : null;
        return new SellerSummaryResponse(
            user.getId(),
            name,
            description,
            profileImageUrl,
            mainArea,
            snsUrl,
            email,
            category,
            phone
        );
    }

    private String resolveName(Users user) {
        if (user.getNickname() != null && !user.getNickname().isBlank()) {
            return user.getNickname();
        }
        if (user.getName() != null && !user.getName().isBlank()) {
            return user.getName();
        }
        return user.getLoginId();
    }
}

