package com.da.itdaing.domain.metric.service;

import com.da.itdaing.domain.metric.dto.ViewEventRequest;
import com.da.itdaing.domain.metric.dto.ViewsTimeseriesResponse;
import com.da.itdaing.domain.metric.dto.ViewsTimeseriesResponse.Point;
import com.da.itdaing.domain.metric.entity.EventLog;
import com.da.itdaing.domain.metric.entity.MetricDailyPopup;
import com.da.itdaing.domain.metric.repository.EventLogRepository;
import com.da.itdaing.domain.metric.repository.MetricDailyPopupRepository;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.domain.common.enums.EventAction;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MetricService {

    private final PopupRepository popupRepository;
    private final UserRepository userRepository;
    private final EventLogRepository eventLogRepository;
    private final MetricDailyPopupRepository metricDailyPopupRepository;

    // ⬇︎ 추가: Redis 로 중복 방지
    private final StringRedisTemplate redis;
    private static final DateTimeFormatter DAY = DateTimeFormatter.BASIC_ISO_DATE; // yyyyMMdd
    private static final ZoneId ZONE = ZoneId.of("Asia/Seoul");

    @Transactional
    public void recordView(ViewEventRequest req, Principal principal) {
        // 1) 유저, 팝업 조회
        Long userId = Long.parseLong(principal.getName());
        Users user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        Popup popup = popupRepository.findById(req.popupId())
            .orElseThrow(() -> new EntityNotFoundException("Popup not found: " + req.popupId()));

        // 2) 이벤트 로그는 '항상' 저장(감사/분석용), 필요하면 unique일 때만 저장하도록 바꿔도 됨
        EventLog log = EventLog.builder()
            .user(user)
            .popup(popup)
            .actionType(EventAction.VIEW)
            .source(req.source())
            .sessionId(req.sessionId())
            .build();
        eventLogRepository.save(log);

        // 3) 세션당-금일 고유 조회인지 체크(SETNX)
        boolean uniqueToday = isFirstViewToday(req.sessionId(), user.getId(), popup.getId());

        if (!uniqueToday) {
            // 중복이면 카운트 증가/일간 집계 생략
            return;
        }

        // 4) 누적 뷰(옵션)
        popup.increaseViewCount();

        // 5) 일 단위 메트릭 upsert
        LocalDate today = LocalDate.now(ZONE);
        MetricDailyPopup m = metricDailyPopupRepository
            .findByPopupIdAndDate(popup.getId(), today)
            .orElseGet(() -> MetricDailyPopup.create(popup, today));

        m.increaseViews(1);
        metricDailyPopupRepository.save(m);
    }

    // 세션ID가 없으면 로그인 사용자ID로 대체하여 '사용자당 고유'로 처리
    private boolean isFirstViewToday(String sessionId, Long userId, Long popupId) {
        String idPart = (sessionId != null && !sessionId.isBlank())
            ? "s:" + sessionId.trim()
            : "u:" + userId; // 세션 없을 때 fallback: 사용자 기준

        LocalDate day = LocalDate.now(ZONE);
        String key = "uv:popup:%d:%s:day:%s".formatted(popupId, idPart, DAY.format(day));

        try {
            Duration ttl = ttlUntilEndOfDay(ZONE);              // 자정까지 유효
            Boolean ok = redis.opsForValue().setIfAbsent(key, "1", ttl); // SETNX + EXPIRE
            return Boolean.TRUE.equals(ok); // true면 '처음' 본 것
        } catch (Exception e) {
            // Redis 장애 시: 기존 동작(카운트 증가) 유지하도록 unique 취급
            return true;
        }
    }

    private static Duration ttlUntilEndOfDay(ZoneId zone) {
        LocalDateTime now = LocalDateTime.now(zone);
        LocalDateTime nextMidnight = now.toLocalDate().plusDays(1).atStartOfDay();
        return Duration.between(now, nextMidnight);
    }

    // ===== 기존 조회수 조회 메서드 유지 =====
    @Transactional(readOnly = true)
    public ViewsTimeseriesResponse getViewsForSeller(Long popupId, String granularity, LocalDate from, LocalDate to, Long sellerId) {
        popupRepository.findByIdWithZoneAndSeller(popupId)
            .filter(p -> p.getSeller().getId().equals(sellerId))
            .orElseThrow(() -> new EntityNotFoundException("Popup not found or not owned by seller"));

        LocalDate effFrom = from != null ? from : LocalDate.now(ZONE).minusDays(6);
        LocalDate effTo   = to   != null ? to   : LocalDate.now(ZONE);

        long total = metricDailyPopupRepository.sumViewsBetween(popupId, effFrom, effTo);

        if ("total".equalsIgnoreCase(granularity)) {
            return new ViewsTimeseriesResponse(popupId, "total", effFrom, effTo, List.of(), total);
        }

        var rows = metricDailyPopupRepository.findAllByPopupIdAndDateBetweenOrderByDateAsc(popupId, effFrom, effTo);
        var series = rows.stream().map(r -> new Point(r.getDate(), r.getViews())).toList();

        return new ViewsTimeseriesResponse(popupId, "daily", effFrom, effTo, series, total);
    }
}
