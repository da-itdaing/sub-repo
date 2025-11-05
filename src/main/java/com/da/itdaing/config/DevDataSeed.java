package com.da.itdaing.config;

import com.da.itdaing.domain.common.enums.CategoryType;
import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.master.*;
import com.da.itdaing.domain.user.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Dev 환경 시드 데이터 초기화
 * - @Profile("dev")로 개발 환경에서만 실행
 * - 애플리케이션 시작 시 기본 마스터 데이터 자동 생성
 */
@Slf4j
@Component
@Profile({"local","dev"})
@RequiredArgsConstructor
public class DevDataSeed implements CommandLineRunner {

    private final RegionRepository regionRepository;
    private final StyleRepository styleRepository;
    private final CategoryRepository categoryRepository;
    private final FeatureRepository featureRepository;
    private final UserRepository userRepository;
    private final ConsumerProfileRepository consumerProfileRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("=== Dev 환경 시드 데이터 초기화 시작 ===");

        seedRegions();
        seedStyles();
        seedCategories();
        seedFeatures();
        seedUsers();

        log.info("=== Dev 환경 시드 데이터 초기화 완료 ===");
    }

    private void seedRegions() {
        if (regionRepository.count() == 0) {
            regionRepository.save(Region.builder().name("남구").build());
            regionRepository.save(Region.builder().name("동구").build());
            regionRepository.save(Region.builder().name("서구").build());
            regionRepository.save(Region.builder().name("북구&광산구").build());
            log.info("✓ 지역 데이터 생성 완료 (4개)");
        } else {
            log.info("• 지역 데이터 이미 존재 ({}개)", regionRepository.count());
        }
    }

    private void seedStyles() {
        if (styleRepository.count() == 0) {
            styleRepository.save(Style.builder().name("미니멀").build());
            styleRepository.save(Style.builder().name("빈티지").build());
            styleRepository.save(Style.builder().name("모던").build());
            styleRepository.save(Style.builder().name("캐주얼").build());
            log.info("✓ 스타일 데이터 생성 완료 (4개)");
        } else {
            log.info("• 스타일 데이터 이미 존재 ({}개)", styleRepository.count());
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            // POPUP 카테고리
            categoryRepository.save(Category.builder().name("패션").type(CategoryType.POPUP).build());
            categoryRepository.save(Category.builder().name("뷰티").type(CategoryType.POPUP).build());
            categoryRepository.save(Category.builder().name("F&B").type(CategoryType.POPUP).build());
            categoryRepository.save(Category.builder().name("라이프스타일").type(CategoryType.POPUP).build());

            // CONSUMER 카테고리
            categoryRepository.save(Category.builder().name("20대").type(CategoryType.CONSUMER).build());
            categoryRepository.save(Category.builder().name("30대").type(CategoryType.CONSUMER).build());
            categoryRepository.save(Category.builder().name("여성").type(CategoryType.CONSUMER).build());
            categoryRepository.save(Category.builder().name("남성").type(CategoryType.CONSUMER).build());

            log.info("✓ 카테고리 데이터 생성 완료 (8개)");
        } else {
            log.info("• 카테고리 데이터 이미 존재 ({}개)", categoryRepository.count());
        }
    }

    private void seedFeatures() {
        if (featureRepository.count() == 0) {
            featureRepository.save(Feature.builder().name("무료 주차").build());
            featureRepository.save(Feature.builder().name("애견 동반").build());
            featureRepository.save(Feature.builder().name("특별 할인").build());
            featureRepository.save(Feature.builder().name("사진 촬영 가능").build());
            featureRepository.save(Feature.builder().name("와이파이 제공").build());
            log.info("✓ 특징 데이터 생성 완료 (5개)");
        } else {
            log.info("• 특징 데이터 이미 존재 ({}개)", featureRepository.count());
        }
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            // 일반 소비자 사용자
            Users consumer = Users.builder()
                    .loginId("consumer1")
                    .password(passwordEncoder.encode("password123"))
                    .name("김소비")
                    .nickname("소비왕")
                    .email("consumer@example.com")
                    .role(UserRole.CONSUMER)
                    .build();
            userRepository.save(consumer);

            ConsumerProfile consumerProfile = ConsumerProfile.builder()
                    .user(consumer)
                    .ageGroup(20)
                    .build();
            consumerProfileRepository.save(consumerProfile);

            // 판매자 사용자
            Users seller = Users.builder()
                    .loginId("seller1")
                   .password(passwordEncoder.encode("password123"))
                    .name("박판매")
                    .nickname("팝업왕")
                    .email("seller@example.com")
                    .role(UserRole.SELLER)
                    .build();
            userRepository.save(seller);

            SellerProfile sellerProfile = SellerProfile.builder()
                    .user(seller)
                    .introduction("안녕하세요! 멋진 팝업스토어를 운영합니다.")
                    .activityRegion("광주 남구")
                    .snsUrl("https://instagram.com/popup_master")
                    .build();
            sellerProfileRepository.save(sellerProfile);

            log.info("✓ 사용자 데이터 생성 완료 (소비자 1명, 판매자 1명)");
        } else {
            log.info("• 사용자 데이터 이미 존재 ({}명)", userRepository.count());
        }
    }
}
