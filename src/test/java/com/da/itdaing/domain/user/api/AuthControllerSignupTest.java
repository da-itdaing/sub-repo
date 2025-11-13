package com.da.itdaing.domain.user.api;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.user.dto.AuthDto;
import com.da.itdaing.domain.user.service.AuthService;
import com.da.itdaing.global.error.ErrorCode;
import com.da.itdaing.global.error.GlobalExceptionHandler;
import com.da.itdaing.global.error.exception.DuplicateResourceException;
import com.da.itdaing.global.error.exception.EntityNotFoundException;
import com.da.itdaing.global.security.JwtAuthFilter;
import com.da.itdaing.global.security.JwtAuthenticationHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Objects;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * AuthController 회원가입 엔드포인트 테스트
 * - Security 필터 비활성화(addFilters=false)로 컨트롤러 슬라이스만 검증
 * - 에러 응답은 GlobalExceptionHandler 포맷을 사용
 */
@WebMvcTest(AuthController.class)
@Import(GlobalExceptionHandler.class)
@AutoConfigureMockMvc(addFilters = false)
@ImportAutoConfiguration(exclude = {
    SecurityAutoConfiguration.class,
    SecurityFilterAutoConfiguration.class
})
@TestPropertySource(properties = "storage.provider=test")
class AuthControllerSignupTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;


    @MockitoBean
    private JwtAuthFilter jwtAuthFilter;

    @MockitoBean
    private JwtAuthenticationHandler jwtAuthenticationHandler;

    // ==========================================
    // 소비자 회원가입 테스트
    // ==========================================

    @Test
    @DisplayName("소비자 회원가입 성공 - 유효한 요청으로 201 Created 응답과 함께 사용자 정보를 반환한다")
    void consumerSignup_success_201() throws Exception {
        // given
        AuthDto.SignupConsumerRequest request = AuthDto.SignupConsumerRequest.builder()
            .email("consumer1@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("P@ssw0rd1!")
            .loginId("consumer1")
            .name("김소비")
            .nickname("소비왕")
            .ageGroup(20)
            .interestCategoryIds(List.of(101L, 105L))
            .styleIds(List.of(12L, 15L, 19L))
            .regionIds(List.of(2L))
            .featureIds(List.of(201L))
            .build();

        AuthDto.SignupResponse response = AuthDto.SignupResponse.builder()
            .userId(1L)
            .email("consumer1@example.com")
            .role(UserRole.CONSUMER)
            .build();

        given(authService.signupConsumer(any(AuthDto.SignupConsumerRequest.class)))
            .willReturn(response);

        // when & then
        mockMvc.perform(post("/api/auth/signup/consumer")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .accept(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.userId").value(1))
            .andExpect(jsonPath("$.data.email").value("consumer1@example.com"))
            .andExpect(jsonPath("$.data.role").value("CONSUMER"));

        // verify
        verify(authService).signupConsumer(any(AuthDto.SignupConsumerRequest.class));
    }

    @Test
    @DisplayName("소비자 회원가입 실패 - 비밀번호 확인 불일치 시 400 Bad Request 응답")
    void consumerSignup_validation_400_whenPasswordConfirmMismatch() throws Exception {
        // given
        AuthDto.SignupConsumerRequest request = AuthDto.SignupConsumerRequest.builder()
            .email("consumer1@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("DifferentPassword!")
            .loginId("consumer1")
            .name("김소비")
            .nickname("소비왕")
            .ageGroup(20)
            .interestCategoryIds(List.of(101L, 105L))
            .styleIds(List.of(12L, 15L, 19L))
            .regionIds(List.of(2L))
            .featureIds(List.of(201L))
            .build();

        // when & then
        mockMvc.perform(post("/api/auth/signup/consumer")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .accept(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(400))
            .andExpect(jsonPath("$.error.code").value("E001"))
            .andExpect(jsonPath("$.error.message").value("입력값이 올바르지 않습니다"));
    }

    @Test
    @DisplayName("소비자 회원가입 실패 - 필수 필드 누락 시 400 Bad Request 응답")
    void consumerSignup_validation_400_whenMissingRequiredFields() throws Exception {
        // given - loginId 누락
        AuthDto.SignupConsumerRequest request = AuthDto.SignupConsumerRequest.builder()
            .email("consumer1@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("P@ssw0rd1!")
            // .loginId("consumer1")  // 누락
            .name("김소비")
            .nickname("소비왕")
            .ageGroup(20)
            .interestCategoryIds(List.of(101L, 105L))
            .styleIds(List.of(12L, 15L, 19L))
            .regionIds(List.of(2L))
            .featureIds(List.of(201L))
            .build();

        // when & then
        mockMvc.perform(post("/api/auth/signup/consumer")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .accept(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(400))
            .andExpect(jsonPath("$.error.code").value("E001"));
    }

    @Test
    @DisplayName("소비자 회원가입 실패 - 유효하지 않은 이메일 형식 시 400 Bad Request 응답")
    void consumerSignup_validation_400_whenInvalidEmailFormat() throws Exception {
        // given
        AuthDto.SignupConsumerRequest request = AuthDto.SignupConsumerRequest.builder()
            .email("invalid-email")  // 유효하지 않은 이메일
            .password("P@ssw0rd1!")
            .passwordConfirm("P@ssw0rd1!")
            .loginId("consumer1")
            .name("김소비")
            .nickname("소비왕")
            .ageGroup(20)
            .interestCategoryIds(List.of(101L, 105L))
            .styleIds(List.of(12L, 15L, 19L))
            .regionIds(List.of(2L))
            .featureIds(List.of(201L))
            .build();

        // when & then
        mockMvc.perform(post("/api/auth/signup/consumer")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(400))
            .andExpect(jsonPath("$.error.code").value("E001"));
    }

    @Test
    @DisplayName("소비자 회원가입 실패 - 이메일 중복 시 409 Conflict 응답")
    void consumerSignup_conflict_409_whenDuplicateEmail() throws Exception {
        // given
        AuthDto.SignupConsumerRequest request = AuthDto.SignupConsumerRequest.builder()
            .email("consumer1@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("P@ssw0rd1!")
            .loginId("consumer1")
            .name("김소비")
            .nickname("소비왕")
            .ageGroup(20)
            .interestCategoryIds(List.of(101L, 105L))
            .styleIds(List.of(12L, 15L, 19L))
            .regionIds(List.of(2L))
            .featureIds(List.of(201L))
            .build();

        given(authService.signupConsumer(any(AuthDto.SignupConsumerRequest.class)))
            .willThrow(new DuplicateResourceException(ErrorCode.DUPLICATE_EMAIL));

        // when & then
        mockMvc.perform(post("/api/auth/signup/consumer")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .accept(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(409))
            .andExpect(jsonPath("$.error.code").value("E202"))
            .andExpect(jsonPath("$.error.message").value("이미 사용 중인 이메일입니다"));
    }

    @Test
    @DisplayName("소비자 회원가입 실패 - 스타일 ID 개수 초과 시 400 Bad Request 응답")
    void consumerSignup_validation_400_whenStyleIdsExceedLimit() throws Exception {
        // given - styleIds 5개 (최대 4개)
        AuthDto.SignupConsumerRequest request = AuthDto.SignupConsumerRequest.builder()
            .email("consumer1@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("P@ssw0rd1!")
            .loginId("consumer1")
            .name("김소비")
            .nickname("소비왕")
            .ageGroup(20)
            .interestCategoryIds(List.of(101L, 105L))
            .styleIds(List.of(12L, 15L, 19L, 20L, 21L))  // 5개 (초과)
            .regionIds(List.of(2L))
            .build();

        // when & then
        mockMvc.perform(post("/api/auth/signup/consumer")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .accept(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(400))
            .andExpect(jsonPath("$.error.code").value("E001"));
    }

    @Test
    @DisplayName("소비자 회원가입 실패 - 지역 ID 개수 초과 시 400 Bad Request 응답")
    void consumerSignup_validation_400_whenRegionIdsExceedLimit() throws Exception {
        // given - regionIds 3개 (최대 2개)
        AuthDto.SignupConsumerRequest request = AuthDto.SignupConsumerRequest.builder()
            .email("consumer1@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("P@ssw0rd1!")
            .loginId("consumer1")
            .name("김소비")
            .nickname("소비왕")
            .ageGroup(20)
            .interestCategoryIds(List.of(101L, 105L))
            .styleIds(List.of(12L, 15L, 19L))
            .regionIds(List.of(1L, 2L, 3L, 4L, 5L))  // 5개 (초과)
            .featureIds(List.of(201L))
            .build();

        // when & then
        mockMvc.perform(post("/api/auth/signup/consumer")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .accept(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(400))
            .andExpect(jsonPath("$.error.code").value("E001"));
    }

    @Test
    @DisplayName("소비자 회원가입 실패 - 존재하지 않는 카테고리 ID 포함 시 404 Not Found 응답")
    void consumerSignup_validation_404_whenInvalidCategoryId() throws Exception {
        // given
        AuthDto.SignupConsumerRequest request = AuthDto.SignupConsumerRequest.builder()
            .email("consumer1@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("P@ssw0rd1!")
            .loginId("consumer1")
            .name("김소비")
            .nickname("소비왕")
            .ageGroup(20)
            .interestCategoryIds(List.of(999L, 1000L))  // 존재하지 않는 ID
            .styleIds(List.of(12L, 15L, 19L))
            .regionIds(List.of(2L))
            .featureIds(List.of(201L))
            .build();

        given(authService.signupConsumer(any(AuthDto.SignupConsumerRequest.class)))
            .willThrow(new EntityNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "존재하지 않는 카테고리가 포함되어 있습니다"));

        // when & then
        mockMvc.perform(post("/api/auth/signup/consumer")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .accept(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(404))
            .andExpect(jsonPath("$.error.code").value("E101"))
            .andExpect(jsonPath("$.error.message").value("존재하지 않는 카테고리가 포함되어 있습니다"));
    }

    @Test
    @DisplayName("소비자 회원가입 실패 - 존재하지 않는 스타일 ID 포함 시 404 Not Found 응답")
    void consumerSignup_validation_404_whenInvalidStyleId() throws Exception {
        // given
        AuthDto.SignupConsumerRequest request = AuthDto.SignupConsumerRequest.builder()
            .email("consumer1@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("P@ssw0rd1!")
            .loginId("consumer1")
            .name("김소비")
            .nickname("소비왕")
            .ageGroup(20)
            .interestCategoryIds(List.of(101L, 105L))
            .styleIds(List.of(999L, 1000L))  // 존재하지 않는 ID
            .regionIds(List.of(2L))
            .featureIds(List.of(201L))
            .build();

        given(authService.signupConsumer(any(AuthDto.SignupConsumerRequest.class)))
            .willThrow(new EntityNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "존재하지 않는 스타일이 포함되어 있습니다"));

        // when & then
        mockMvc.perform(post("/api/auth/signup/consumer")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .accept(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(404))
            .andExpect(jsonPath("$.error.code").value("E101"))
            .andExpect(jsonPath("$.error.message").value("존재하지 않는 스타일이 포함되어 있습니다"));
    }

    @Test
    @DisplayName("소비자 회원가입 실패 - 존재하지 않는 지역 ID 포함 시 404 Not Found 응답")
    void consumerSignup_validation_404_whenInvalidRegionId() throws Exception {
        // given
        AuthDto.SignupConsumerRequest request = AuthDto.SignupConsumerRequest.builder()
            .email("consumer1@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("P@ssw0rd1!")
            .loginId("consumer1")
            .name("김소비")
            .nickname("소비왕")
            .ageGroup(20)
            .interestCategoryIds(List.of(101L, 105L))
            .styleIds(List.of(12L, 15L, 19L))
            .regionIds(List.of(999L))  // 존재하지 않는 ID
            .featureIds(List.of(201L))
            .build();

        given(authService.signupConsumer(any(AuthDto.SignupConsumerRequest.class)))
            .willThrow(new EntityNotFoundException(ErrorCode.ENTITY_NOT_FOUND, "존재하지 않는 지역이 포함되어 있습니다"));

        // when & then
        mockMvc.perform(post("/api/auth/signup/consumer")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(404))
            .andExpect(jsonPath("$.error.code").value("E101"))
            .andExpect(jsonPath("$.error.message").value("존재하지 않는 지역이 포함되어 있습니다"));
    }

    // ==========================================
    // 판매자 회원가입 테스트
    // ==========================================

    @Test
    @DisplayName("판매자 회원가입 성공 - 유효한 요청으로 201 Created 응답과 함께 사용자 정보를 반환한다")
    void sellerSignup_success_201() throws Exception {
        // given
        AuthDto.SignupSellerRequest request = AuthDto.SignupSellerRequest.builder()
            .email("seller@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("P@ssw0rd1!")
            .loginId("seller1")
            .name("박판매")
            .nickname("팝업왕")
            .activityRegion("광주/남구")
            .snsUrl("https://instagram.com/popup_seller")
            .profileImageUrl("https://cdn.example.com/profiles/popup_seller.png")
            .introduction("팝업 운영 3년차, 굿즈 위주")
            .build();

        AuthDto.SellerProfileInfo profileInfo = AuthDto.SellerProfileInfo.builder()
            .activityRegion("광주/남구")
            .snsUrl("https://instagram.com/popup_seller")
            .profileImageUrl("https://cdn.example.com/profiles/popup_seller.png")
            .introduction("팝업 운영 3년차, 굿즈 위주")
            .build();

        AuthDto.SignupResponse response = AuthDto.SignupResponse.builder()
            .userId(2L)
            .email("seller@example.com")
            .role(UserRole.SELLER)
            .profile(profileInfo)
            .build();

        given(authService.signupSeller(any(AuthDto.SignupSellerRequest.class)))
            .willReturn(response);

        // when & then
        mockMvc.perform(post("/api/auth/signup/seller")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .accept(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.userId").value(2))
            .andExpect(jsonPath("$.data.email").value("seller@example.com"))
            .andExpect(jsonPath("$.data.role").value("SELLER"))
            .andExpect(jsonPath("$.data.profile.activityRegion").value("광주/남구"))
            .andExpect(jsonPath("$.data.profile.snsUrl").value("https://instagram.com/popup_seller"))
            .andExpect(jsonPath("$.data.profile.profileImageUrl").value("https://cdn.example.com/profiles/popup_seller.png"))
            .andExpect(jsonPath("$.data.profile.introduction").value("팝업 운영 3년차, 굿즈 위주"));

        // ArgumentCaptor로 서비스에 전달된 DTO 검증
        ArgumentCaptor<AuthDto.SignupSellerRequest> captor =
            ArgumentCaptor.forClass(AuthDto.SignupSellerRequest.class);
        verify(authService).signupSeller(captor.capture());

        AuthDto.SignupSellerRequest capturedRequest = captor.getValue();
        assertThat(capturedRequest.getLoginId()).isEqualTo("seller1");
        assertThat(capturedRequest.getEmail()).isEqualTo("seller@example.com");
        assertThat(capturedRequest.getName()).isEqualTo("박판매");
        assertThat(capturedRequest.getNickname()).isEqualTo("팝업왕");
        assertThat(capturedRequest.getActivityRegion()).isEqualTo("광주/남구");
        assertThat(capturedRequest.getSnsUrl()).isEqualTo("https://instagram.com/popup_seller");
    }

    @Test
    @DisplayName("판매자 회원가입 실패 - loginId 누락 시 400 Bad Request 응답")
    void sellerSignup_validation_400_whenMissingLoginId() throws Exception {
        // given - loginId 누락
        AuthDto.SignupSellerRequest request = AuthDto.SignupSellerRequest.builder()
            .email("seller@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("P@ssw0rd1!")
            // .loginId("seller1")  // 누락
            .name("박판매")
            .nickname("팝업왕")
            .build();

        // when & then
        mockMvc.perform(post("/api/auth/signup/seller")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .accept(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(400))
            .andExpect(jsonPath("$.error.code").value("E001"));
    }

    @Test
    @DisplayName("판매자 회원가입 실패 - name 누락 시 400 Bad Request 응답")
    void sellerSignup_validation_400_whenMissingName() throws Exception {
        // given - name 누락
        AuthDto.SignupSellerRequest request = AuthDto.SignupSellerRequest.builder()
            .email("seller@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("P@ssw0rd1!")
            .loginId("seller1")
            // .name("박판매")  // 누락
            .nickname("팝업왕")
            .build();

        // when & then
        mockMvc.perform(post("/api/auth/signup/seller")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .accept(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(400))
            .andExpect(jsonPath("$.error.code").value("E001"));
    }

    @Test
    @DisplayName("판매자 회원가입 실패 - 비밀번호 확인 불일치 시 400 Bad Request 응답")
    void sellerSignup_validation_400_whenPasswordConfirmMismatch() throws Exception {
        // given
        AuthDto.SignupSellerRequest request = AuthDto.SignupSellerRequest.builder()
            .email("seller@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("DifferentPassword!")
            .loginId("seller1")
            .name("박판매")
            .nickname("팝업왕")
            .build();

        // when & then
        mockMvc.perform(post("/api/auth/signup/seller")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .accept(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(400))
            .andExpect(jsonPath("$.error.code").value("E001"));
    }

    @Test
    @DisplayName("판매자 회원가입 실패 - 유효하지 않은 loginId 패턴 시 400 Bad Request 응답")
    void sellerSignup_validation_400_whenInvalidLoginIdPattern() throws Exception {
        // given - loginId에 허용되지 않는 문자 포함
        AuthDto.SignupSellerRequest request = AuthDto.SignupSellerRequest.builder()
            .email("seller@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("P@ssw0rd1!")
            .loginId("SELLER@123")  // 대문자 및 @ 기호 포함 (패턴 위반)
            .name("박판매")
            .nickname("팝업왕")
            .build();

        // when & then
        mockMvc.perform(post("/api/auth/signup/seller")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(400))
            .andExpect(jsonPath("$.error.code").value("E001"));
    }

    @Test
    @DisplayName("판매자 회원가입 실패 - 이메일 중복 시 409 Conflict 응답")
    void sellerSignup_conflict_409_whenDuplicateEmail() throws Exception {
        // given
        AuthDto.SignupSellerRequest request = AuthDto.SignupSellerRequest.builder()
            .email("seller@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("P@ssw0rd1!")
            .loginId("seller1")
            .name("박판매")
            .nickname("팝업왕")
            .activityRegion("광주/남구")
            .build();

        given(authService.signupSeller(any(AuthDto.SignupSellerRequest.class)))
            .willThrow(new DuplicateResourceException(ErrorCode.DUPLICATE_EMAIL));

        // when & then
        mockMvc.perform(post("/api/auth/signup/seller")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .accept(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(409))
            .andExpect(jsonPath("$.error.code").value("E202"))
            .andExpect(jsonPath("$.error.message").value("이미 사용 중인 이메일입니다"));
    }

    @Test
    @DisplayName("판매자 회원가입 실패 - 비밀번호 길이 부족 시 400 Bad Request 응답")
    void sellerSignup_validation_400_whenPasswordTooShort() throws Exception {
        // given
        AuthDto.SignupSellerRequest request = AuthDto.SignupSellerRequest.builder()
            .email("seller@example.com")
            .password("short")  // 8자 미만
            .passwordConfirm("short")
            .loginId("seller1")
            .name("박판매")
            .nickname("팝업왕")
            .activityRegion("광주/남구")
            .build();

        // when & then
        mockMvc.perform(post("/api/auth/signup/seller")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .accept(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(400))
            .andExpect(jsonPath("$.error.code").value("E001"));
    }

    @Test
    @DisplayName("판매자 회원가입 실패 - activityRegion 누락 시 400 Bad Request 응답")
    void sellerSignup_validation_400_whenMissingActivityRegion() throws Exception {
        // given - activityRegion 누락
        AuthDto.SignupSellerRequest request = AuthDto.SignupSellerRequest.builder()
            .email("seller@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("P@ssw0rd1!")
            .loginId("seller1")
            .name("박판매")
            .nickname("팝업왕")
            // .activityRegion("광주/남구")  // 누락
            .build();

        // when & then
        mockMvc.perform(post("/api/auth/signup/seller")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .accept(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(400))
            .andExpect(jsonPath("$.error.code").value("E001"))
            .andExpect(jsonPath("$.error.message").value("입력값이 올바르지 않습니다"));
    }

    @Test
    @DisplayName("판매자 회원가입 실패 - snsUrl 형식 불일치 시 400 Bad Request 응답")
    void sellerSignup_validation_400_whenInvalidSnsUrlFormat() throws Exception {
        // given - 잘못된 URL 형식
        AuthDto.SignupSellerRequest request = AuthDto.SignupSellerRequest.builder()
            .email("seller@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("P@ssw0rd1!")
            .loginId("seller1")
            .name("박판매")
            .nickname("팝업왕")
            .activityRegion("광주/남구")
            .snsUrl("invalid-url-format")  // http:// 또는 https:// 없음
            .build();

        // when & then
        mockMvc.perform(post("/api/auth/signup/seller")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.status").value(400))
            .andExpect(jsonPath("$.error.code").value("E001"))
            .andExpect(jsonPath("$.error.message").value("입력값이 올바르지 않습니다"));
    }

    @Test
    @DisplayName("판매자 회원가입 성공 - 선택 필드(snsUrl, profileImageUrl, introduction) 없이도 성공")
    void sellerSignup_success_201_withoutOptionalFields() throws Exception {
        // given - 필수 필드만 입력
        AuthDto.SignupSellerRequest request = AuthDto.SignupSellerRequest.builder()
            .email("seller2@example.com")
            .password("P@ssw0rd1!")
            .passwordConfirm("P@ssw0rd1!")
            .loginId("seller2")
            .name("이판매")
            .nickname("신참판매자")
            .activityRegion("서울/강남구")
            // snsUrl, profileImageUrl, introduction 없음
            .build();

        AuthDto.SellerProfileInfo profileInfo = AuthDto.SellerProfileInfo.builder()
            .activityRegion("서울/강남구")
            .build();

        AuthDto.SignupResponse response = AuthDto.SignupResponse.builder()
            .userId(3L)
            .email("seller2@example.com")
            .role(UserRole.SELLER)
            .profile(profileInfo)
            .build();

        given(authService.signupSeller(any(AuthDto.SignupSellerRequest.class)))
            .willReturn(response);

        // when & then
        mockMvc.perform(post("/api/auth/signup/seller")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .accept(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(objectMapper.writeValueAsString(request)))
            .andDo(print())
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.userId").value(3))
            .andExpect(jsonPath("$.data.email").value("seller2@example.com"))
            .andExpect(jsonPath("$.data.role").value("SELLER"))
            .andExpect(jsonPath("$.data.profile.activityRegion").value("서울/강남구"));
    }
}
