package com.da.itdaing.domain.user.repository;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.master.entity.Category;
import com.da.itdaing.domain.master.entity.Feature;
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.entity.Style;
import com.da.itdaing.domain.master.repository.CategoryRepository;
import com.da.itdaing.domain.master.repository.FeatureRepository;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.domain.master.repository.StyleRepository;
import com.da.itdaing.domain.user.entity.*;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@JpaSliceTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired private CategoryRepository categoryRepository;
    @Autowired private StyleRepository styleRepository;
    @Autowired private RegionRepository regionRepository;
    @Autowired private FeatureRepository featureRepository;

    @Autowired private UserPrefCategoryRepository userPrefCategoryRepository;
    @Autowired private UserPrefStyleRepository userPrefStyleRepository;
    @Autowired private UserPrefRegionRepository userPrefRegionRepository;
    @Autowired private UserPrefFeatureRepository userPrefFeatureRepository;

    @Test
    @DisplayName("CONSUMER 가입 시 Category/Style/Region/Feature 선호를 1~4개 함께 저장한다")
    void consumerSignUp_saves1to4PreferencesEach() {
        // 1) 마스터 데이터 시딩 (각 1~4개)
        List<Category> categories = categoryRepository.saveAll(List.of(
            Category.builder().name("패션").build(),
            Category.builder().name("뷰티").build(),
            Category.builder().name("음식").build()
        ));
        List<Style> styles = styleRepository.saveAll(List.of(
            Style.builder().name("혼자여도 좋은").build(),
            Style.builder().name("감성적인").build()
        ));
        List<Region> regions = regionRepository.saveAll(List.of(
            Region.builder().name("남구").build()
        ));
        List<Feature> features = featureRepository.saveAll(List.of(
            Feature.builder().name("무료주차").build(),
            Feature.builder().name("무료입장").build(),
            Feature.builder().name("예약가능").build(),
            Feature.builder().name("굿즈판매").build()
        ));

        // 2) CONSUMER 사용자 생성/저장
        Users consumer = Users.builder()
            .loginId("consumer_pref")
            .password("encoded_pw")
            .name("선호소비자")
            .nickname("취향부자")
            .email("consumer_pref@example.com")
            .ageGroup(20)
            .role(UserRole.CONSUMER)
            .build();
        Users savedUser = userRepository.save(consumer);

        // 3) 선호 조인 테이블 저장 (카테고리 3개, 스타일 2개, 지역 1개, 편의 4개 → 각 1~4개 충족)
        userPrefCategoryRepository.saveAll(categories.stream()
            .map(c -> UserPrefCategory.builder().user(savedUser).category(c).build())
            .toList());

        userPrefStyleRepository.saveAll(styles.stream()
            .map(s -> UserPrefStyle.builder().user(savedUser).style(s).build())
            .toList());

        userPrefRegionRepository.saveAll(regions.stream()
            .map(r -> UserPrefRegion.builder().user(savedUser).region(r).build())
            .toList());

        userPrefFeatureRepository.saveAll(features.stream()
            .map(f -> UserPrefFeature.builder().user(savedUser).feature(f).build())
            .toList());

        // 4) 검증: 사용자 기본 정보 + 선호 카운트/연결 무결성
        Users found = userRepository.findById(savedUser.getId()).orElseThrow();
        assertThat(found.getRole()).isEqualTo(UserRole.CONSUMER);
        assertThat(found.getCreatedAt()).isNotNull();

        // 선호가 1~4 범위로 저장되었는지 (이번 케이스: 3,2,1,4)
        assertThat(userPrefCategoryRepository.findAll().size()).isEqualTo(3);
        assertThat(userPrefStyleRepository.findAll().size()).isEqualTo(2);
        assertThat(userPrefRegionRepository.findAll().size()).isEqualTo(1);
        assertThat(userPrefFeatureRepository.findAll().size()).isEqualTo(4);

        // 모든 선호 레코드가 해당 user와 연결되어 있는지 (무결성)
        assertThat(userPrefCategoryRepository.findAll())
            .allMatch(upc -> upc.getUser().getId().equals(savedUser.getId()));
        assertThat(userPrefStyleRepository.findAll())
            .allMatch(ups -> ups.getUser().getId().equals(savedUser.getId()));
        assertThat(userPrefRegionRepository.findAll())
            .allMatch(upr -> upr.getUser().getId().equals(savedUser.getId()));
        assertThat(userPrefFeatureRepository.findAll())
            .allMatch(upf -> upf.getUser().getId().equals(savedUser.getId()));
    }

    @Test
    @DisplayName("SELLER 가입: 기본 필드만 저장되며 선호 테이블에는 행이 없다")
    void sellerSignUp_savesBasicFields_only_noPreferences() {
        // given
        Users seller = Users.builder()
            .loginId("seller_join")
            .password("encoded_pw_seller")
            .name("박판매")
            .nickname("팝업킹")
            .email("seller_join@example.com")
            .role(UserRole.SELLER)
            .build();

        // when
        Users saved = userRepository.save(seller);
        Users found = userRepository.findById(saved.getId()).orElseThrow();

        // then: 사용자 기본 필드 확인
        assertThat(found.getId()).isNotNull();
        assertThat(found.getLoginId()).isEqualTo("seller_join");
        assertThat(found.getEmail()).isEqualTo("seller_join@example.com");
        assertThat(found.getRole()).isEqualTo(UserRole.SELLER);
        assertThat(found.getCreatedAt()).isNotNull();

        // then: 선호 조인 테이블은 비어 있어야 함 (가입 시 저장하지 않음)
        assertThat(userPrefCategoryRepository.findAll()).isEmpty();
        assertThat(userPrefStyleRepository.findAll()).isEmpty();
        assertThat(userPrefRegionRepository.findAll()).isEmpty();
        assertThat(userPrefFeatureRepository.findAll()).isEmpty();
    }

    @Test
    void 동일한_이메일로_중복_가입할_수_없다() {
        // given
        Users user1 = Users.builder()
            .loginId("user1")
            .password("pass1")
            .email("same@example.com")
            .role(UserRole.CONSUMER)
            .build();
        userRepository.save(user1);

        Users user2 = Users.builder()
            .loginId("user2")
            .password("pass2")
            .email("same@example.com")
            .role(UserRole.CONSUMER)
            .build();

        // when & then
        assertThatThrownBy(() -> {
            userRepository.save(user2);
            userRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void 동일한_로그인ID로_중복_가입할_수_없다() {
        // given
        Users user1 = Users.builder()
            .loginId("samelogin")
            .password("pass1")
            .email("user1@example.com")
            .role(UserRole.CONSUMER)
            .build();
        userRepository.save(user1);

        Users user2 = Users.builder()
            .loginId("samelogin")
            .password("pass2")
            .email("user2@example.com")
            .role(UserRole.CONSUMER)
            .build();

        // when & then
        assertThatThrownBy(() -> {
            userRepository.save(user2);
            userRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }
}
