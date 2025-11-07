package com.da.itdaing.config;

import com.da.itdaing.domain.common.enums.CategoryType;
import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.master.Category;
import com.da.itdaing.domain.master.CategoryRepository;
import com.da.itdaing.domain.master.Feature;
import com.da.itdaing.domain.master.FeatureRepository;
import com.da.itdaing.domain.master.Region;
import com.da.itdaing.domain.master.RegionRepository;
import com.da.itdaing.domain.master.Style;
import com.da.itdaing.domain.master.StyleRepository;
import com.da.itdaing.domain.seller.entity.SellerProfile;
import com.da.itdaing.domain.seller.repository.SellerProfileRepository;
import com.da.itdaing.domain.user.entity.UserPrefCategory;
import com.da.itdaing.domain.user.entity.UserPrefRegion;
import com.da.itdaing.domain.user.entity.UserPrefStyle;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserPrefCategoryRepository;
import com.da.itdaing.domain.user.repository.UserPrefRegionRepository;
import com.da.itdaing.domain.user.repository.UserPrefStyleRepository;
import com.da.itdaing.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 로컬 개발용 데이터 시딩 컴포넌트.
 * - 마스터: Category / Style / Region / Feature
 * - 사용자: CONSUMER 1명(취향 1~4개씩 연결), SELLER 2명(그중 1명은 SellerProfile 생성)
 */
@Slf4j
@Component
@Profile("local")
@RequiredArgsConstructor
@Transactional
public class DevDataSeed implements CommandLineRunner {

    // Master repos
    private final CategoryRepository categoryRepository;
    private final StyleRepository styleRepository;
    private final RegionRepository regionRepository;
    private final FeatureRepository featureRepository;

    // User repos
    private final UserRepository userRepository;
    private final UserPrefCategoryRepository userPrefCategoryRepository;
    private final UserPrefStyleRepository userPrefStyleRepository;
    private final UserPrefRegionRepository userPrefRegionRepository;

    // Seller repos
    private final SellerProfileRepository sellerProfileRepository;

    @Override
    public void run(String... args) {
        log.info("===== [DevDataSeed] START =====");
        seedMaster();
        seedUsersAndPrefs();
        seedSellersAndProfile();
        log.info("===== [DevDataSeed] DONE =====");
    }

    /* =========================
       Master seed
       ========================= */
    private void seedMaster() {
        // Category (CONSUMER / POPUP 양쪽 모두 심음)
        if (categoryRepository.count() == 0) {
            List<String> consumerCats = List.of(
                "패션", "뷰티", "음식", "건강", "공연/전시", "스포츠", "키즈", "아트", "굿즈", "반려동물"
            );
            consumerCats.forEach(name -> categoryRepository.save(
                Category.builder().name(name).type(CategoryType.CONSUMER).build()
            ));
            // 동일 명칭을 POPUP 타입으로도 심어두면 팝업 등록 필터에 바로 재사용 가능
            consumerCats.forEach(name -> categoryRepository.save(
                Category.builder().name(name).type(CategoryType.POPUP).build()
            ));
            log.info("Seeded {} categories (CONSUMER/POPUP)", consumerCats.size() * 2);
        }

        // Style
        if (styleRepository.count() == 0) {
            List<String> styles = List.of(
                "혼자여도 좋은", "가족과 함께", "친구와 함께", "연인과 함께", "반려동물과 함께",
                "아기자기한", "감성적인", "활기찬", "차분한",
                "체험하기 좋은", "포토존", "레트로/빈티지", "체험가능", "실내", "야외"
            );
            styles.forEach(s -> styleRepository.save(Style.builder().name(s).build()));
            log.info("Seeded {} styles", styles.size());
        }

        // Region
        if (regionRepository.count() == 0) {
            List<String> regions = List.of("남구", "동구", "서구", "북구/광산구");
            regions.forEach(r -> regionRepository.save(Region.builder().name(r).build()));
            log.info("Seeded {} regions", regions.size());
        }

        // Feature (사용자 선호 엔티티는 아직 없지만, 팝업/필터용으로 마스터만 심어둠)
        if (featureRepository.count() == 0) {
            List<String> features = List.of("무료주차", "무료입장", "예약가능", "굿즈판매");
            features.forEach(f -> featureRepository.save(Feature.builder().name(f).build()));
            log.info("Seeded {} features", features.size());
        }
    }

    /* =========================
       Users & Preferences seed
       ========================= */
    private void seedUsersAndPrefs() {
        // CONSUMER 1명 + 취향 1~4개씩 연결
        Users consumer = userRepository.findByLoginId("consumer1").orElse(null);
        if (consumer == null) {
            consumer = userRepository.save(
                Users.builder()
                    .loginId("consumer1")
                    .password("pass!1234") // 로컬용 더미
                    .name("김소비")
                    .nickname("소비왕")
                    .email("consumer1@example.com")
                    .ageGroup(20)
                    .mbti("INFP")
                    .role(UserRole.CONSUMER)
                    .build()
            );
            log.info("Seeded CONSUMER user: id={}, loginId={}", consumer.getId(), consumer.getLoginId());
        }

        // 선호 Category (최소 1~최대 4개) - CONSUMER 타입에서 상위 3개만 연결
        if (userPrefCategoryRepository.count() == 0) {
            List<Category> consumerCats = categoryRepository.findAll().stream()
                .filter(c -> c.getType() == CategoryType.CONSUMER)
                .limit(3) // 1~4개 규칙 중 3개 예시
                .toList();
            for (Category c : consumerCats) {
                userPrefCategoryRepository.save(UserPrefCategory.builder()
                    .user(consumer)
                    .category(c)
                    .build());
            }
            log.info("Linked {} consumer category prefs to user {}", consumerCats.size(), consumer.getId());
        }

        // 선호 Style (상위 3개)
        if (userPrefStyleRepository.count() == 0) {
            List<Style> styles = styleRepository.findAll().stream().limit(3).toList();
            for (Style s : styles) {
                userPrefStyleRepository.save(UserPrefStyle.builder()
                    .user(consumer)
                    .style(s)
                    .build());
            }
            log.info("Linked {} style prefs to user {}", styles.size(), consumer.getId());
        }

        // 선호 Region (상위 2개)
        if (userPrefRegionRepository.count() == 0) {
            List<Region> regions = regionRepository.findAll().stream().limit(2).toList();
            for (Region r : regions) {
                userPrefRegionRepository.save(UserPrefRegion.builder()
                    .user(consumer)
                    .region(r)
                    .build());
            }
            log.info("Linked {} region prefs to user {}", regions.size(), consumer.getId());
        }
    }

    /* =========================
       Sellers & SellerProfile seed
       ========================= */
    private void seedSellersAndProfile() {
        // SELLER 1 (프로필 있음)
        Users seller1 = userRepository.findByLoginId("seller1").orElse(null);
        if (seller1 == null) {
            seller1 = userRepository.save(
                Users.builder()
                    .loginId("seller1")
                    .password("pass!1234")
                    .name("박판매")
                    .nickname("팝업왕")
                    .email("seller1@example.com")
                    .role(UserRole.SELLER)
                    .build()
            );
            log.info("Seeded SELLER user: id={}, loginId={}", seller1.getId(), seller1.getLoginId());
        }

        // seller1 프로필 없으면 생성
        boolean profileExists = sellerProfileRepository.findByUserId(seller1.getId()).isPresent();
        if (!profileExists) {
            SellerProfile profile = SellerProfile.builder()
                .user(seller1) // @MapsId 매핑이라면 PK = user_id
                .profileImageUrl("https://cdn.example.com/profiles/seller1.png")
                .introduction("팝업 운영 3년차, 굿즈 전문")
                .activityRegion("광주 남구")
                .snsUrl("https://instagram.com/popup_seller")
                .build();
            sellerProfileRepository.save(profile);
            log.info("Seeded SellerProfile for userId={}", seller1.getId());
        }

        // SELLER 2 (프로필 없음)
        Users seller2 = userRepository.findByLoginId("seller2").orElse(null);
        if (seller2 == null) {
            seller2 = userRepository.save(
                Users.builder()
                    .loginId("seller2")
                    .password("pass!1234")
                    .name("이판매")
                    .nickname("굿즈장인")
                    .email("seller2@example.com")
                    .role(UserRole.SELLER)
                    .build()
            );
            log.info("Seeded SELLER user (no profile): id={}, loginId={}", seller2.getId(), seller2.getLoginId());
        }
    }
}
