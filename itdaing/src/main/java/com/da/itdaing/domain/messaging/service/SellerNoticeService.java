package com.da.itdaing.domain.messaging.service;

import com.da.itdaing.domain.common.enums.AnnouncementAudience;
import com.da.itdaing.domain.messaging.dto.NoticeCreateRequest;
import com.da.itdaing.domain.messaging.dto.NoticeResponse;
import com.da.itdaing.domain.messaging.entity.Announcement;
import com.da.itdaing.domain.messaging.repository.AnnouncementRepository;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.global.error.exception.EntityNotFoundException;
import com.da.itdaing.global.error.exception.BusinessException;
import com.da.itdaing.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerNoticeService {

    private final AnnouncementRepository announcementRepository;
    private final PopupRepository popupRepository;
    private final UserRepository userRepository;

    /**
     * 판매자의 모든 팝업에 대한 공지사항 목록 조회
     */
    @Transactional(readOnly = true)
    public Page<NoticeResponse> getMyNotices(Long sellerUserId, Pageable pageable) {
        // 판매자가 소유한 모든 팝업의 공지사항 조회
        return announcementRepository.findByAuthorIdOrderByCreatedAtDesc(sellerUserId, pageable)
            .map(NoticeResponse::from);
    }

    /**
     * 공지사항 상세 조회
     */
    @Transactional(readOnly = true)
    public NoticeResponse getNoticeById(Long sellerUserId, Long noticeId) {
        Announcement announcement = announcementRepository.findById(noticeId)
            .orElseThrow(() -> new EntityNotFoundException("Notice not found"));

        // 작성자 본인 또는 관리자만 조회 가능
        if (!announcement.getAuthor().getId().equals(sellerUserId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        return NoticeResponse.from(announcement);
    }

    /**
     * 공지사항 등록
     */
    public NoticeResponse createNotice(Long sellerUserId, NoticeCreateRequest request) {
        Users seller = userRepository.findById(sellerUserId)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Popup popup = null;
        if (request.getPopupId() != null) {
            popup = popupRepository.findById(request.getPopupId())
                .orElseThrow(() -> new EntityNotFoundException("Popup not found"));

            // 팝업 소유자 검증
            if (!popup.getSeller().getId().equals(sellerUserId)) {
                throw new BusinessException(ErrorCode.ACCESS_DENIED);
            }
        }

        AnnouncementAudience audience = AnnouncementAudience.ALL;
        if (request.getAudience() != null) {
            try {
                audience = AnnouncementAudience.valueOf(request.getAudience());
            } catch (IllegalArgumentException e) {
                audience = AnnouncementAudience.ALL;
            }
        }

        Announcement announcement = Announcement.builder()
            .author(seller)
            .popup(popup)
            .audience(audience)
            .title(request.getTitle())
            .content(request.getContent())
            .build();

        Announcement saved = announcementRepository.save(announcement);
        return NoticeResponse.from(saved);
    }

    /**
     * 공지사항 수정
     */
    public NoticeResponse updateNotice(Long sellerUserId, Long noticeId, NoticeCreateRequest request) {
        Announcement announcement = announcementRepository.findById(noticeId)
            .orElseThrow(() -> new EntityNotFoundException("Notice not found"));

        // 작성자 본인만 수정 가능
        if (!announcement.getAuthor().getId().equals(sellerUserId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        announcement.update(request.getTitle(), request.getContent());
        return NoticeResponse.from(announcement);
    }

    /**
     * 공지사항 삭제
     */
    public void deleteNotice(Long sellerUserId, Long noticeId) {
        Announcement announcement = announcementRepository.findById(noticeId)
            .orElseThrow(() -> new EntityNotFoundException("Notice not found"));

        // 작성자 본인만 삭제 가능
        if (!announcement.getAuthor().getId().equals(sellerUserId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        announcementRepository.delete(announcement);
    }

    /**
     * 공지사항 다중 삭제
     */
    public void deleteNotices(Long sellerUserId, List<Long> noticeIds) {
        for (Long noticeId : noticeIds) {
            deleteNotice(sellerUserId, noticeId);
        }
    }

    /**
     * 공지 조회 (판매자 기준 + 특정 팝업)
     */
    @Transactional(readOnly = true)
    public Page<NoticeResponse> getNotices(Long sellerUserId, Long popupId, Pageable pageable) {
        Popup popup = popupRepository.findById(popupId)
            .orElseThrow(() -> new EntityNotFoundException("Popup not found"));

        return announcementRepository.findByPopupIdOrderByCreatedAtDesc(popupId, pageable)
            .map(NoticeResponse::from);
    }

    /**
     * 판매자용 전체 공지사항 조회 (ALL + SELLER 대상)
     */
    @Transactional(readOnly = true)
    public Page<NoticeResponse> getSellerNotices(Pageable pageable) {
        List<AnnouncementAudience> audiences = Arrays.asList(
            AnnouncementAudience.ALL,
            AnnouncementAudience.SELLER
        );
        return announcementRepository.findByAudienceInOrderByCreatedAtDesc(audiences, pageable)
            .map(NoticeResponse::from);
    }

    /**
     * 공지사항 상세 조회 (권한 체크 없음 - 공개 공지용)
     */
    @Transactional(readOnly = true)
    public NoticeResponse getNoticeByIdPublic(Long noticeId) {
        Announcement announcement = announcementRepository.findById(noticeId)
            .orElseThrow(() -> new EntityNotFoundException("Notice not found"));
        return NoticeResponse.from(announcement);
    }
}
