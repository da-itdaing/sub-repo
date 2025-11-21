package com.da.itdaing.config;

import com.da.itdaing.domain.common.enums.*;
import com.da.itdaing.domain.geo.entity.ZoneArea;
import com.da.itdaing.domain.geo.entity.ZoneCell;
import com.da.itdaing.domain.geo.repository.ZoneAreaRepository;
import com.da.itdaing.domain.geo.repository.ZoneCellRepository;
import com.da.itdaing.domain.master.entity.Category;
import com.da.itdaing.domain.master.entity.Feature;
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.entity.Style;
import com.da.itdaing.domain.master.repository.CategoryRepository;
import com.da.itdaing.domain.master.repository.FeatureRepository;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.domain.master.repository.StyleRepository;
import com.da.itdaing.domain.messaging.entity.Message;
import com.da.itdaing.domain.messaging.entity.MessageAttachment;
import com.da.itdaing.domain.messaging.entity.MessageThread;
import com.da.itdaing.domain.messaging.repository.MessageAttachmentRepository;
import com.da.itdaing.domain.messaging.repository.MessageRepository;
import com.da.itdaing.domain.messaging.repository.MessageThreadRepository;
import com.da.itdaing.domain.mock.dto.MockConsumerProfile;
import com.da.itdaing.domain.mock.dto.MockMessage;
import com.da.itdaing.domain.mock.dto.MockMessageAttachment;
import com.da.itdaing.domain.mock.dto.MockMessageThread;
import com.da.itdaing.domain.mock.dto.MockParticipant;
import com.da.itdaing.domain.mock.dto.MockPopup;
import com.da.itdaing.domain.mock.dto.MockPopupOperatingHour;
import com.da.itdaing.domain.mock.dto.MockReview;
import com.da.itdaing.domain.mock.dto.MockSeller;
import com.da.itdaing.domain.mock.dto.MockZone;
import com.da.itdaing.domain.mock.dto.MockZoneCell;
import com.da.itdaing.domain.mock.service.MockDataService;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.entity.PopupCategory;
import com.da.itdaing.domain.popup.entity.PopupFeature;
import com.da.itdaing.domain.popup.entity.PopupImage;
import com.da.itdaing.domain.popup.entity.PopupStyle;
import com.da.itdaing.domain.popup.repository.PopupCategoryRepository;
import com.da.itdaing.domain.popup.repository.PopupFeatureRepository;
import com.da.itdaing.domain.popup.repository.PopupImageRepository;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.popup.repository.PopupStyleRepository;
import com.da.itdaing.domain.seller.entity.SellerProfile;
import com.da.itdaing.domain.seller.repository.SellerProfileRepository;
import com.da.itdaing.domain.social.entity.Review;
import com.da.itdaing.domain.social.entity.ReviewImage;
import com.da.itdaing.domain.social.repository.ReviewImageRepository;
import com.da.itdaing.domain.social.repository.ReviewRepository;
import com.da.itdaing.domain.user.entity.UserPrefCategory;
import com.da.itdaing.domain.user.entity.UserPrefRegion;
import com.da.itdaing.domain.user.entity.UserPrefStyle;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserPrefCategoryRepository;
import com.da.itdaing.domain.user.repository.UserPrefRegionRepository;
import com.da.itdaing.domain.user.repository.UserPrefStyleRepository;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 로컬 개발용 데이터 시딩 컴포넌트.
 * - 마스터: Category / Style / Region / Feature
 * - 사용자: ADMIN 3명, CONSUMER 10명(취향 연결), SELLER 50명(mock 기반)
 * - 지도/팝업/리뷰/메시지: mock JSON 기반으로 기본 데이터 생성
 */
@Slf4j
@Component
@Profile("local")
@RequiredArgsConstructor
@Transactional
@SuppressWarnings("null")
public class DevDataSeed implements CommandLineRunner {

    // Master repos
    private final CategoryRepository categoryRepository;
    private final StyleRepository styleRepository;
    private final RegionRepository regionRepository;
    private final FeatureRepository featureRepository;

    // Geo repos
    private final ZoneAreaRepository zoneAreaRepository;
    private final ZoneCellRepository zoneCellRepository;

    // User repos
    private final UserRepository userRepository;
    private final UserPrefCategoryRepository userPrefCategoryRepository;
    private final UserPrefStyleRepository userPrefStyleRepository;
    private final UserPrefRegionRepository userPrefRegionRepository;

    // Seller repos
    private final SellerProfileRepository sellerProfileRepository;

    // Popup repos
    private final PopupRepository popupRepository;
    private final PopupImageRepository popupImageRepository;
    private final PopupCategoryRepository popupCategoryRepository;
    private final PopupFeatureRepository popupFeatureRepository;
    private final PopupStyleRepository popupStyleRepository;

    // Social repos
    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;

    // Messaging repos
    private final MessageThreadRepository messageThreadRepository;
    private final MessageRepository messageRepository;
    private final MessageAttachmentRepository messageAttachmentRepository;

    private final PasswordEncoder passwordEncoder;
    private final MockDataService mockDataService;
    private final ObjectMapper objectMapper;

    private Users adminUser;
    private Users consumerUser;
    private Users seller1User;
    private Users seller2User;

    private final Map<Long, ZoneCell> zoneCellByMockId = new HashMap<>();
    private final Map<Long, Popup> popupByMockId = new HashMap<>();
    private final Map<Long, Users> sellerByMockId = new HashMap<>();

    @Override
    public void run(String... args) {
        log.info("===== [DevDataSeed] START =====");
        zoneCellByMockId.clear();
        popupByMockId.clear();
        sellerByMockId.clear();
        seedMaster();
        seedAdmins();
        seedConsumersAndPrefs();
        seedSellersAndProfile();
        seedZonesAndCells();
        seedPopups();
        seedReviews();
        seedMessages();
        log.info("===== [DevDataSeed] DONE =====");
    }

    /* =========================
       Master seed
       ========================= */
    private void seedMaster() {
        if (categoryRepository.count() == 0) {
            List<String> categories = List.of(
                "패션", "뷰티", "음식", "건강", "공연/전시", "스포츠", "키즈", "아트", "굿즈", "반려동물"
            );
            categories.forEach(name -> categoryRepository.save(Category.builder().name(name).build()));
            log.info("Seeded {} categories", categories.size());
        }

        if (styleRepository.count() == 0) {
            List<String> styles = List.of(
                "혼자여도 좋은", "가족과 함께", "친구와 함께", "연인과 함께", "반려동물과 함께",
                "아기자기한", "감성적인", "활기찬", "차분한",
                "체험하기 좋은", "포토존", "레트로/빈티지", "체험가능", "실내", "야외"
            );
            styles.forEach(s -> styleRepository.save(Style.builder().name(s).build()));
            log.info("Seeded {} styles", styles.size());
        }

        if (regionRepository.count() == 0) {
            List<String> regions = List.of("남구", "동구", "서구", "북구/광산구");
            regions.forEach(r -> regionRepository.save(Region.builder().name(r).build()));
            log.info("Seeded {} regions", regions.size());
        }

        if (featureRepository.count() == 0) {
            List<String> features = List.of("무료주차", "무료입장", "예약가능", "굿즈판매");
            features.forEach(f -> featureRepository.save(Feature.builder().name(f).build()));
            log.info("Seeded {} features", features.size());
        }
    }

    /* =========================
       Admin seed
       ========================= */
    private void seedAdmins() {
        List<AdminSeed> seeds = List.of(
            new AdminSeed("admin", "admin!1234", "관리자", "슈퍼관리자", "admin@example.com"),
            new AdminSeed("admin2", "admin!1234", "박운영", "운영매니저", "admin2@example.com"),
            new AdminSeed("admin3", "admin!1234", "최감독", "현장관리자", "admin3@example.com")
        );

        Users primaryAdmin = this.adminUser;

        for (AdminSeed seed : seeds) {
            Users admin = userRepository.findByLoginId(seed.loginId()).orElseGet(() ->
                userRepository.save(
                    Users.builder()
                        .loginId(seed.loginId())
                        .password(passwordEncoder.encode(seed.password()))
                        .name(seed.name())
                        .nickname(seed.nickname())
                        .email(seed.email())
                        .role(UserRole.ADMIN)
                        .status(UserStatus.ACTIVE)
                        .build()
                )
            );

            if (primaryAdmin == null) {
                primaryAdmin = admin;
            }
        }

        this.adminUser = primaryAdmin;
        if (adminUser != null) {
            log.info("Seeded {} admin accounts. Primary admin loginId={}", seeds.size(), adminUser.getLoginId());
        }
    }

    /* =========================
       Users & Preferences seed
       ========================= */
    private void seedConsumersAndPrefs() {
        List<MockConsumerProfile> profiles = mockDataService.getConsumerProfiles();
        if (profiles.isEmpty()) {
            seedDefaultConsumerFallback();
            return;
        }

        Map<String, Category> categoryByName = categoryRepository.findAll().stream()
            .collect(Collectors.toMap(cat -> normalizeKey(cat.getName()), cat -> cat, (a, b) -> a));
        Map<String, Style> styleByName = styleRepository.findAll().stream()
            .collect(Collectors.toMap(style -> normalizeKey(style.getName()), style -> style, (a, b) -> a));
        Map<String, Region> regionByName = regionRepository.findAll().stream()
            .collect(Collectors.toMap(region -> normalizeKey(region.getName()), region -> region, (a, b) -> a));

        int targetCount = Math.min(10, profiles.size());
        for (int i = 0; i < targetCount; i++) {
            MockConsumerProfile profile = profiles.get(i);
            final int index = i;
            String loginId = Optional.ofNullable(profile.username()).filter(id -> !id.isBlank()).orElse("consumer" + (i + 1));
            String email = Optional.ofNullable(profile.email()).filter(e -> !e.isBlank()).orElse(loginId + "@example.com");

            Users consumer = userRepository.findByLoginId(loginId).orElseGet(() ->
                userRepository.save(
                    Users.builder()
                        .loginId(loginId)
                        .password(passwordEncoder.encode("pass!1234"))
                        .name(Optional.ofNullable(profile.name()).orElse("소비자" + (index + 1)))
                        .nickname(Optional.ofNullable(profile.nickname()).orElse(loginId))
                        .email(email)
                        .ageGroup(parseAgeGroup(profile.ageGroup()))
                        .mbti(profile.mbti())
                        .role(UserRole.CONSUMER)
                        .status(UserStatus.ACTIVE)
                        .build()
                )
            );

            if (consumerUser == null) {
                consumerUser = consumer;
            }

            attachCategoryPrefs(consumer, profile.interests(), categoryByName);
            attachStylePrefs(consumer, profile.moods(), styleByName);
            attachRegionPrefs(consumer, profile.regions(), regionByName);
        }

        if (consumerUser == null) {
            seedDefaultConsumerFallback();
        }
    }

    private void seedDefaultConsumerFallback() {
        Users consumer = userRepository.findByLoginId("consumer1").orElseGet(() ->
            userRepository.save(
                Users.builder()
                    .loginId("consumer1")
                    .password(passwordEncoder.encode("pass!1234"))
                    .name("김소비")
                    .nickname("소비왕")
                    .email("consumer1@example.com")
                    .ageGroup(20)
                    .mbti("INFP")
                    .role(UserRole.CONSUMER)
                    .status(UserStatus.ACTIVE)
                    .build()
            )
        );

        consumerUser = consumer;

        categoryRepository.findAll().stream()
            .limit(3)
            .forEach(category -> {
                if (!userPrefCategoryRepository.existsByUserAndCategory(consumer, category)) {
                    userPrefCategoryRepository.save(UserPrefCategory.builder().user(consumer).category(category).build());
                }
            });

        styleRepository.findAll().stream()
            .limit(3)
            .forEach(style -> {
                if (!userPrefStyleRepository.existsByUserAndStyle(consumer, style)) {
                    userPrefStyleRepository.save(UserPrefStyle.builder().user(consumer).style(style).build());
                }
            });

        regionRepository.findAll().stream()
            .limit(2)
            .forEach(region -> {
                if (!userPrefRegionRepository.existsByUserAndRegion(consumer, region)) {
                    userPrefRegionRepository.save(UserPrefRegion.builder().user(consumer).region(region).build());
                }
            });
    }

    private void attachCategoryPrefs(Users user, List<String> names, Map<String, Category> categoryByName) {
        if (names == null || names.isEmpty()) {
            return;
        }
        names.stream()
            .map(this::normalizeKey)
            .map(categoryByName::get)
            .filter(Objects::nonNull)
            .forEach(category -> {
                if (!userPrefCategoryRepository.existsByUserAndCategory(user, category)) {
                    userPrefCategoryRepository.save(UserPrefCategory.builder().user(user).category(category).build());
                }
            });
    }

    private void attachStylePrefs(Users user, List<String> names, Map<String, Style> styleByName) {
        if (names == null || names.isEmpty()) {
            return;
        }
        names.stream()
            .map(this::normalizeKey)
            .map(styleByName::get)
            .filter(Objects::nonNull)
            .forEach(style -> {
                if (!userPrefStyleRepository.existsByUserAndStyle(user, style)) {
                    userPrefStyleRepository.save(UserPrefStyle.builder().user(user).style(style).build());
                }
            });
    }

    private void attachRegionPrefs(Users user, List<String> names, Map<String, Region> regionByName) {
        if (names == null || names.isEmpty()) {
            return;
        }
        names.stream()
            .map(this::normalizeKey)
            .map(regionByName::get)
            .filter(Objects::nonNull)
            .forEach(region -> {
                if (!userPrefRegionRepository.existsByUserAndRegion(user, region)) {
                    userPrefRegionRepository.save(UserPrefRegion.builder().user(user).region(region).build());
                }
            });
    }

    private Integer parseAgeGroup(String ageGroup) {
        if (ageGroup == null || ageGroup.isBlank()) {
            return null;
        }
        String digits = ageGroup.replaceAll("\\D", "");
        if (digits.isEmpty()) {
            return null;
        }
        try {
            int parsed = Integer.parseInt(digits);
            return parsed - (parsed % 10);
        } catch (NumberFormatException ex) {
            log.warn("Unable to parse age group '{}'", ageGroup);
            return null;
        }
    }

    private String normalizeKey(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    /* =========================
       Sellers & SellerProfile seed
       ========================= */
    private void seedSellersAndProfile() {
        List<MockSeller> mockSellers = mockDataService.getSellers();
        if (!mockSellers.isEmpty()) {
            for (MockSeller mock : mockSellers) {
                String loginId = "seller" + mock.id();
                Users sellerUser = userRepository.findByLoginId(loginId).orElseGet(() ->
                    userRepository.save(
                        Users.builder()
                            .loginId(loginId)
                            .password(passwordEncoder.encode("pass!1234"))
                            .name(mock.name())
                            .nickname(mock.name())
                            .email(Optional.ofNullable(mock.email()).orElse(loginId + "@example.com"))
                            .role(UserRole.SELLER)
                            .status(UserStatus.ACTIVE)
                            .build()
                    )
                );

                SellerProfile profile = sellerProfileRepository.findByUserId(sellerUser.getId())
                    .orElseGet(() -> sellerProfileRepository.save(
                        SellerProfile.builder()
                            .user(sellerUser)
                            .profileImageUrl(mock.profileImage())
                            .introduction(mock.description())
                            .activityRegion(mock.mainArea())
                            .snsUrl(mock.sns())
                            .category(mock.category())
                            .contactPhone(mock.phone())
                            .build()
                    ));
                profile.update(
                    mock.profileImage(),
                    null, // profileImageKey
                    mock.description(),
                    mock.mainArea(),
                    mock.sns(),
                    mock.category(),
                    mock.phone()
                );

                sellerByMockId.put(mock.id(), sellerUser);
            }

            seller1User = sellerByMockId.values().stream().findFirst().orElse(null);
            seller2User = sellerByMockId.values().stream().skip(1).findFirst().orElse(seller1User);
            return;
        }

        Users seller1 = userRepository.findByLoginId("seller1").orElse(null);
        if (seller1 == null) {
            seller1 = userRepository.save(
                Users.builder()
                    .loginId("seller1")
                    .password(passwordEncoder.encode("pass!1234"))
                    .name("박판매")
                    .nickname("팝업왕")
                    .email("seller1@example.com")
                    .role(UserRole.SELLER)
                    .status(UserStatus.ACTIVE)
                    .build()
            );
            log.info("Seeded SELLER user: id={}, loginId={}", seller1.getId(), seller1.getLoginId());
        }
        this.seller1User = seller1;

        boolean profileExists = sellerProfileRepository.findByUserId(seller1.getId()).isPresent();
        if (!profileExists) {
            SellerProfile profile = SellerProfile.builder()
                .user(seller1)
                .profileImageUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop")
                .introduction("광주 지역 플리마켓을 기획하고 지역 소상공인과 협업하는 비영리 단체입니다.")
                .activityRegion("동구")
                .snsUrl("https://instagram.com/da_it_daing")
                .category("기획/운영")
                .contactPhone("062-123-4567")
                .build();
            sellerProfileRepository.save(profile);
            log.info("Seeded SellerProfile for userId={}", seller1.getId());
        }

        Users seller2 = userRepository.findByLoginId("seller2").orElse(null);
        if (seller2 == null) {
            seller2 = userRepository.save(
                Users.builder()
                    .loginId("seller2")
                    .password(passwordEncoder.encode("pass!1234"))
                    .name("이판매")
                    .nickname("플레이팩토리")
                    .email("seller2@example.com")
                    .role(UserRole.SELLER)
                    .status(UserStatus.ACTIVE)
                    .build()
            );
            log.info("Seeded SELLER user (no profile): id={}, loginId={}", seller2.getId(), seller2.getLoginId());
        }
        this.seller2User = seller2;
        sellerByMockId.put(201L, seller1);
        sellerByMockId.put(202L, seller2);
    }

    /* =========================
       Geo + Popup seed (from mock JSON)
       ========================= */
    private void seedZonesAndCells() {
        if (zoneAreaRepository.count() > 0 || zoneCellRepository.count() > 0) {
            log.info("ZoneArea/ZoneCell already seeded. Skipping mock zone import.");
            return;
        }

        List<MockZone> zones = mockDataService.getZones();
        if (zones.isEmpty()) {
            log.info("No mock zones found. Skip zone seeding.");
            return;
        }

        Map<Long, Region> regionById = regionRepository.findAll().stream()
            .collect(Collectors.toMap(Region::getId, region -> region));
        Map<Long, Users> sellerLookup = buildSellerMockLookup();

        for (MockZone zone : zones) {
            Region region = regionById.getOrDefault(
                Long.valueOf(zone.regionId()),
                regionById.values().stream().findFirst().orElse(null)
            );
            String geometryJson = writeGeometry(zone);

            ZoneArea zoneArea = zoneAreaRepository.save(
                ZoneArea.builder()
                    .region(Objects.requireNonNullElseGet(region, () -> regionRepository.findAll().stream().findFirst().orElse(null)))
                    .name(zone.name())
                    .polygonGeoJson(geometryJson)
                    .status(mapAreaStatus(zone.status()))
                    .maxCapacity(zone.maxCapacity())
                    .notice(zone.notice())
                    .build()
            );

            for (MockZoneCell cell : zone.cells()) {
                Users owner = resolveOwner(cell.reservedBy(), sellerLookup);
                ZoneCell zoneCell = zoneCellRepository.save(
                    ZoneCell.builder()
                        .zoneArea(zoneArea)
                        .owner(owner)
                        .label(cell.label())
                        .detailedAddress(null)
                        .lat(cell.lat())
                        .lng(cell.lng())
                        .status(mapZoneStatus(cell.status()))
                        .maxCapacity(cell.maxCapacity())
                        .notice(cell.notice())
                        .build()
                );
                zoneCellByMockId.put(cell.id(), zoneCell);
            }
        }

        log.info("Seeded {} zone areas and {} zone cells from mock data.",
            zoneAreaRepository.count(), zoneCellRepository.count());
    }

    private void seedPopups() {
        if (popupRepository.count() > 0) {
            log.info("Popups already seeded. Skipping mock popup import.");
            return;
        }

        if (zoneCellByMockId.isEmpty()) {
            log.warn("Zone cell mapping is empty. Skip popup seeding to avoid inconsistent data.");
            return;
        }

        Map<Long, Users> sellerLookup = buildSellerMockLookup();
        List<MockPopup> popups = mockDataService.getPopups();
        if (popups.isEmpty()) {
            log.info("No mock popups found. Skip popup seeding.");
            return;
        }

        for (MockPopup mock : popups) {
            Users seller = sellerLookup.get(mock.sellerId());
            if (seller == null) {
                log.warn("Skip popup {} - seller {} not found.", mock.id(), mock.sellerId());
                continue;
            }

            ZoneCell zoneCell = zoneCellByMockId.get(mock.cellId());
            if (zoneCell == null) {
                log.warn("Skip popup {} - zone cell {} not found.", mock.id(), mock.cellId());
                continue;
            }

            String operatingTime = buildOperatingTime(mock);
            Popup popup = popupRepository.save(
                Popup.builder()
                    .seller(seller)
                    .zoneCell(zoneCell)
                    .name(mock.title())
                    .description(mock.description())
                    .startDate(parseDate(mock.startDate()))
                    .endDate(parseDate(mock.endDate()))
                    .operatingTime(operatingTime)
                    .approvalStatus(parseApprovalStatus(mock.status()))
                    .viewCount((long) mock.viewCount())
                    .build()
            );
            popupByMockId.put(mock.id(), popup);

            if (mock.thumbnail() != null && !mock.thumbnail().isBlank()) {
                popupImageRepository.save(
                    PopupImage.builder()
                        .popup(popup)
                        .imageUrl(mock.thumbnail())
                        .isThumbnail(true)
                        .build()
                );
            }

            Optional.ofNullable(mock.gallery())
                .orElse(List.of())
                .stream()
                .filter(url -> url != null && !url.isBlank())
                .forEach(url -> popupImageRepository.save(
                    PopupImage.builder()
                        .popup(popup)
                        .imageUrl(url)
                        .isThumbnail(false)
                        .build()
                ));

            Optional.ofNullable(mock.categoryIds())
                .map(list -> list.stream().map(Long::valueOf).toList())
                .ifPresent(ids -> categoryRepository.findAllById(ids)
                    .forEach(category ->
                        popupCategoryRepository.save(
                            PopupCategory.builder()
                                .popup(popup)
                                .category(category)
                                .categoryRole("POPUP")
                                .build()
                        )));

            Optional.ofNullable(mock.featureIds())
                .map(list -> list.stream().map(Long::valueOf).toList())
                .ifPresent(ids -> featureRepository.findAllById(ids)
                    .forEach(feature ->
                        popupFeatureRepository.save(
                            PopupFeature.builder()
                                .popup(popup)
                                .feature(feature)
                                .build()
                        )));

            Optional.ofNullable(mock.styleTags())
                .filter(tags -> !tags.isEmpty())
                .map(tags -> styleRepository.findByNameIn(tags))
                .ifPresent(styles ->
                    styles.forEach(style ->
                        popupStyleRepository.save(
                            PopupStyle.builder()
                                .popup(popup)
                                .style(style)
                                .build()
                        )));
        }

        log.info("Seeded {} popups from mock data.", popupRepository.count());
    }

    private void seedReviews() {
        if (reviewRepository.count() > 0) {
            log.info("Reviews already seeded. Skipping mock review import.");
            return;
        }

        if (popupByMockId.isEmpty()) {
            log.info("Popup mapping empty. Skip review seeding.");
            return;
        }

        List<MockReview> reviews = mockDataService.getReviews();
        if (reviews.isEmpty()) {
            log.info("No mock reviews found. Skip review seeding.");
            return;
        }

        for (MockReview mock : reviews) {
            Popup popup = popupByMockId.get(mock.popupId());
            if (popup == null) {
                log.warn("Skip review {} - popup {} not found.", mock.id(), mock.popupId());
                continue;
            }

            Users reviewer = resolveReviewAuthor(mock);
            byte rating = (byte) Math.max(1, Math.min(5, mock.rating()));
            Review review = reviewRepository.save(
                Review.builder()
                    .consumer(reviewer)
                    .popup(popup)
                    .rating(rating)
                    .content(mock.content())
                    .build()
            );

            Optional.ofNullable(mock.images())
                .orElse(List.of())
                .stream()
                .filter(url -> url != null && !url.isBlank())
                .forEach(url ->
                    reviewImageRepository.save(
                        ReviewImage.builder()
                            .review(review)
                            .imageUrl(url)
                            .build()
                    )
                );
        }

        log.info("Seeded {} reviews from mock data.", reviewRepository.count());
    }

    private void seedMessages() {
        if (messageThreadRepository.count() > 0) {
            log.info("Message threads already seeded. Skipping mock message import.");
            return;
        }

        List<MockMessageThread> threads = mockDataService.getMessageThreads();
        if (threads.isEmpty()) {
            log.info("No mock message threads found. Skip message seeding.");
            return;
        }

        Map<Long, Users> sellerLookup = buildSellerMockLookup();

        for (MockMessageThread mock : threads) {
            MockParticipant sellerPart = findParticipantByRole(mock, "SELLER");
            if (sellerPart == null) {
                log.warn("Skip thread {} - seller participant missing.", mock.threadId());
                continue;
            }
            Users seller = resolveSellerFromMock(sellerPart.id(), sellerLookup);
            if (seller == null) {
                log.warn("Skip thread {} - seller for mock id {} not found.", mock.threadId(), sellerPart.id());
                continue;
            }

            MockParticipant adminPart = findParticipantByRole(mock, "ADMIN");
            Users admin = resolveAdminFromMock(adminPart);

            MessageThread thread = MessageThread.create(seller, admin, mock.subject());
            LocalDateTime createdAt = extractEarliestMessageTime(mock);
            LocalDateTime updatedAt = parseDateTime(mock.updatedAt());

            LocalDateTime initialCreated = createdAt != null ? createdAt : LocalDateTime.now();
            LocalDateTime initialUpdated = updatedAt != null ? updatedAt : initialCreated;
            thread.overrideTimestamps(initialCreated, initialUpdated);
            messageThreadRepository.save(thread);

            Map<Long, Long> mockToActual = buildMockToActualIdMap(sellerPart, seller, adminPart, admin);
            Set<Long> unreadActualIds = mapUnreadTargets(mock.unreadBy(), mockToActual);

            List<MockMessage> messages = Optional.ofNullable(mock.messages()).orElse(List.of());
            for (MockMessage mockMessage : messages) {
                Users sender = resolveMessageAuthor(mockMessage, seller, admin);
                Users receiver = determineReceiver(sender, seller, admin);
                if (sender == null || receiver == null) {
                    log.warn("Skip message {} in thread {} - sender or receiver not resolved.", mockMessage.messageId(), mock.threadId());
                    continue;
                }

                LocalDateTime sentAt = parseDateTime(mockMessage.createdAt());
                Message message = Message.builder()
                    .thread(thread)
                    .sender(sender)
                    .receiver(receiver)
                    .title(thread.getSubject())
                    .content(mockMessage.body())
                    .sentAt(sentAt)
                    .build();
                messageRepository.save(message);

                List<MockMessageAttachment> attachments = Optional.ofNullable(mockMessage.attachments()).orElse(List.of());
                for (MockMessageAttachment attachment : attachments) {
                    if (attachment.url() == null || attachment.url().isBlank()) {
                        continue;
                    }
                    messageAttachmentRepository.save(
                        MessageAttachment.builder()
                            .message(message)
                            .fileUrl(attachment.url())
                            .originalName(attachment.name())
                            .build()
                    );
                }

                if (!unreadActualIds.contains(receiver.getId())) {
                    message.markReadAt(sentAt);
                    messageRepository.save(message);
                }
            }

            long unreadForSeller = messageRepository.countByThreadAndReceiver_IdAndReadAtIsNull(thread, seller.getId());
            Integer unreadForAdmin = admin != null
                ? (int) messageRepository.countByThreadAndReceiver_IdAndReadAtIsNull(thread, admin.getId())
                : null;

            thread.updateUnreadCounts((int) unreadForSeller, unreadForAdmin);
            thread.overrideTimestamps(initialCreated, initialUpdated);
            messageThreadRepository.save(thread);
        }

        log.info("Seeded {} message threads from mock data.", messageThreadRepository.count());
    }

    private MockParticipant findParticipantByRole(MockMessageThread thread, String role) {
        if (thread.participants() == null || role == null) {
            return null;
        }
        MockParticipant sender = thread.participants().sender();
        MockParticipant receiver = thread.participants().receiver();
        if (sender != null && role.equalsIgnoreCase(sender.role())) {
            return sender;
        }
        if (receiver != null && role.equalsIgnoreCase(receiver.role())) {
            return receiver;
        }
        return null;
    }

    private Users resolveSellerFromMock(Long mockId, Map<Long, Users> sellerLookup) {
        if (mockId != null && sellerLookup.containsKey(mockId)) {
            return sellerLookup.get(mockId);
        }
        if (!sellerLookup.isEmpty()) {
            return sellerLookup.values().iterator().next();
        }
        return Optional.ofNullable(seller1User).orElse(seller2User);
    }

    private Users resolveAdminFromMock(MockParticipant adminPart) {
        if (adminPart == null) {
            return adminUser;
        }
        if (adminUser != null) {
            return adminUser;
        }
        return userRepository.findByLoginId("admin").orElse(null);
    }

    private Users resolveMessageAuthor(MockMessage mockMessage, Users seller, Users admin) {
        if (mockMessage == null) {
            return null;
        }
        if ("SELLER".equalsIgnoreCase(mockMessage.authorRole())) {
            return seller;
        }
        if ("ADMIN".equalsIgnoreCase(mockMessage.authorRole())) {
            return admin;
        }
        if ("CONSUMER".equalsIgnoreCase(mockMessage.authorRole())) {
            return Optional.ofNullable(consumerUser).orElse(admin != null ? admin : seller);
        }
        return null;
    }

    private Users determineReceiver(Users sender, Users seller, Users admin) {
        if (sender == null) {
            return null;
        }
        if (admin != null && sender.getId().equals(admin.getId())) {
            return seller;
        }
        return admin != null ? admin : seller;
    }

    private Map<Long, Long> buildMockToActualIdMap(
        MockParticipant sellerPart,
        Users seller,
        MockParticipant adminPart,
        Users admin
    ) {
        Map<Long, Long> map = new HashMap<>();
        if (sellerPart != null && seller != null) {
            map.put(sellerPart.id(), seller.getId());
        }
        if (adminPart != null && admin != null) {
            map.put(adminPart.id(), admin.getId());
        }
        if (consumerUser != null) {
            map.putIfAbsent(consumerUser.getId(), consumerUser.getId());
        }
        return map;
    }

    private Set<Long> mapUnreadTargets(List<Long> unreadMockIds, Map<Long, Long> mapping) {
        Set<Long> targets = new HashSet<>();
        if (unreadMockIds == null || unreadMockIds.isEmpty()) {
            return targets;
        }
        for (Long mockId : unreadMockIds) {
            if (mockId == null) {
                continue;
            }
            Long actualId = mapping.get(mockId);
            if (actualId != null) {
                targets.add(actualId);
            }
        }
        return targets;
    }

    private record AdminSeed(String loginId, String password, String name, String nickname, String email) {
    }

    private LocalDateTime extractEarliestMessageTime(MockMessageThread thread) {
        return Optional.ofNullable(thread.messages())
            .orElse(List.of())
            .stream()
            .map(msg -> parseDateTime(msg.createdAt()))
            .filter(Objects::nonNull)
            .sorted()
            .findFirst()
            .orElse(null);
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return OffsetDateTime.parse(value).toLocalDateTime();
        } catch (DateTimeParseException ex) {
            try {
                return LocalDateTime.parse(value);
            } catch (DateTimeParseException ignored) {
                log.warn("Failed to parse datetime '{}'", value);
                return null;
            }
        }
    }

    private Map<Long, Users> buildSellerMockLookup() {
        if (!sellerByMockId.isEmpty()) {
            return sellerByMockId;
        }
        Map<Long, Users> map = new HashMap<>();
        if (seller1User != null) {
            map.put(201L, seller1User);
        }
        if (seller2User != null) {
            map.put(202L, seller2User);
        }
        return map;
    }

    private Users resolveReviewAuthor(MockReview mock) {
        if (mock.author() == null || mock.author().id() <= 0) {
            return Optional.ofNullable(consumerUser)
                .orElse(Optional.ofNullable(adminUser).orElse(seller1User));
        }

        String loginId = "reviewer" + mock.author().id();
        return userRepository.findByLoginId(loginId).orElseGet(() -> {
            String name = Optional.ofNullable(mock.author().name()).orElse("리뷰어" + mock.author().id());
            Users reviewer = Users.builder()
                .loginId(loginId)
                .password(passwordEncoder.encode("pass!1234"))
                .name(name)
                .nickname(name)
                .email(loginId + "@example.com")
                .role(UserRole.CONSUMER)
                .status(UserStatus.ACTIVE)
                .build();
            return userRepository.save(reviewer);
        });
    }

    private Users resolveOwner(Long reservedBy, Map<Long, Users> sellerLookup) {
        if (reservedBy != null && sellerLookup.containsKey(reservedBy)) {
            return sellerLookup.get(reservedBy);
        }
        if (adminUser != null) {
            return adminUser;
        }
        if (seller1User != null) {
            return seller1User;
        }
        if (seller2User != null) {
            return seller2User;
        }
        return userRepository.findAll().stream().findFirst()
            .orElseThrow(() -> new IllegalStateException("No user available to own zone cell"));
    }

    private String writeGeometry(MockZone zone) {
        try {
            return objectMapper.writeValueAsString(zone.geometry());
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize geometry for zone {}. Using null.", zone.id(), e);
            return null;
        }
    }

    private AreaStatus mapAreaStatus(String status) {
        if (status == null || status.isBlank()) {
            return AreaStatus.AVAILABLE;
        }
        try {
            return AreaStatus.valueOf(status.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return AreaStatus.AVAILABLE;
        }
    }

    private ZoneStatus mapZoneStatus(String status) {
        if (status == null || status.isBlank()) {
            return ZoneStatus.APPROVED;
        }
        return switch (status.toUpperCase(Locale.ROOT)) {
            case "PENDING" -> ZoneStatus.PENDING;
            case "HIDDEN" -> ZoneStatus.HIDDEN;
            case "REJECTED" -> ZoneStatus.REJECTED;
            default -> ZoneStatus.APPROVED;
        };
    }

    private String buildOperatingTime(MockPopup mock) {
        List<MockPopupOperatingHour> hours = mock.operatingHours();
        if (hours != null && !hours.isEmpty()) {
            return hours.stream()
                .map(item -> item.day() + " " + item.time())
                .collect(Collectors.joining(" / "));
        }
        return mock.hours();
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException ex) {
            log.warn("Failed to parse date '{}'", value);
            return null;
        }
    }

    private ApprovalStatus parseApprovalStatus(String status) {
        if (status == null || status.isBlank()) {
            return ApprovalStatus.PENDING;
        }
        try {
            return ApprovalStatus.valueOf(status.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return ApprovalStatus.PENDING;
        }
    }
}
