// src/main/java/com/da/itdaing/domain/messaging/service/SellerNoticeService.java
package com.da.itdaing.domain.messaging.service;

import com.da.itdaing.domain.messaging.dto.NoticeCreateRequest;
import com.da.itdaing.domain.messaging.dto.NoticeResponse;
import com.da.itdaing.domain.messaging.entity.Announcement;
import com.da.itdaing.domain.messaging.repository.AnnouncementRepository;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.global.error.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerNoticeService {

    private final AnnouncementRepository announcementRepository;
    private final PopupRepository popupRepository;
    private final UserRepository userRepository;

    /**
     * 공지 등록
     */
    public NoticeResponse createNotice(Long sellerUserId, NoticeCreateRequest request) {
        // 1) 판매자 존재 여부 확인 (필요 없으면 이 블록은 지워도 됨)
        Users seller = userRepository.findById(sellerUserId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // 2) 팝업 존재 여부 확인
        Popup popup = popupRepository.findById(request.getPopupId())
            .orElseThrow(() -> new EntityNotFoundException("Popup not found"));

        // 3) (선택) 팝업 소유자 검증 로직 - 실제 필드명에 맞게 수정해서 써
        // if (!popup.getSeller().getId().equals(seller.getId())) {
        //     throw new BusinessException(ErrorCode.ACCESS_DENIED);
        // }

        Announcement announcement = Announcement.builder()
            .popup(popup)
            .title(request.getTitle())
            .content(request.getContent())
            .build();

        Announcement saved = announcementRepository.save(announcement);

        return NoticeResponse.from(saved);
    }

    /**
     * 공지 조회 (판매자 기준 + 특정 팝업)
     */
    @Transactional(readOnly = true)
    public Page<NoticeResponse> getNotices(Long sellerUserId, Long popupId, Pageable pageable) {
        // 1) 팝업 존재 확인(+ 선택: 판매자 소유 검증)
        Popup popup = popupRepository.findById(popupId)
            .orElseThrow(() -> new EntityNotFoundException("Popup not found"));

        // (선택) 팝업 소유자 검증 로직
        // if (!popup.getSeller().getId().equals(sellerUserId)) {
        //     throw new BusinessException(ErrorCode.ACCESS_DENIED);
        // }

        return announcementRepository.findByPopupIdOrderByCreatedAtDesc(popupId, pageable)
            .map(NoticeResponse::from);
    }
}
