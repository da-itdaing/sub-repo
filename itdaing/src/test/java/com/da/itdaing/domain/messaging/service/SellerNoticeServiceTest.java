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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SellerNoticeServiceTest {

    @Mock
    private AnnouncementRepository announcementRepository;

    @Mock
    private PopupRepository popupRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SellerNoticeService sellerNoticeService;

    @Test
    @DisplayName("createNotice: 판매자/팝업이 존재하면 공지를 저장하고 응답을 반환한다")
    void createNotice_saves_andReturnsResponse() {
        // given
        Long sellerId = 1L;
        Long popupId = 10L;

        NoticeCreateRequest request = NoticeCreateRequest.builder()
            .popupId(popupId)
            .title("공지 제목")
            .content("공지 내용")
            .build();

        Users seller = mock(Users.class);
        Popup popup = mock(Popup.class);
        Announcement savedAnnouncement = mock(Announcement.class);

        when(userRepository.findById(sellerId)).thenReturn(Optional.of(seller));
        when(popupRepository.findById(popupId)).thenReturn(Optional.of(popup));
        when(announcementRepository.save(any(Announcement.class)))
            .thenReturn(savedAnnouncement);

        when(popup.getId()).thenReturn(popupId);
        when(savedAnnouncement.getId()).thenReturn(100L);
        when(savedAnnouncement.getPopup()).thenReturn(popup);
        when(savedAnnouncement.getTitle()).thenReturn(request.getTitle());
        when(savedAnnouncement.getContent()).thenReturn(request.getContent());
        when(savedAnnouncement.getCreatedAt()).thenReturn(LocalDateTime.now());

        // when
        NoticeResponse response = sellerNoticeService.createNotice(sellerId, request);

        // then
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getPopupId()).isEqualTo(popupId);
        assertThat(response.getTitle()).isEqualTo("공지 제목");
        assertThat(response.getContent()).isEqualTo("공지 내용");

        verify(userRepository).findById(sellerId);
        verify(popupRepository).findById(popupId);
        verify(announcementRepository).save(any(Announcement.class));
    }

    @Test
    @DisplayName("createNotice: 판매자가 존재하지 않으면 EntityNotFoundException 발생")
    void createNotice_throws_whenSellerNotFound() {
        // given
        Long sellerId = 1L;
        Long popupId = 10L;

        NoticeCreateRequest request = NoticeCreateRequest.builder()
            .popupId(popupId)
            .title("공지 제목")
            .content("공지 내용")
            .build();

        when(userRepository.findById(sellerId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> sellerNoticeService.createNotice(sellerId, request))
            .isInstanceOf(EntityNotFoundException.class)
            .hasMessageContaining("User not found");

        verify(userRepository).findById(sellerId);
        verify(popupRepository, never()).findById(any());
        verify(announcementRepository, never()).save(any());
    }

    @Test
    @DisplayName("createNotice: 팝업이 존재하지 않으면 EntityNotFoundException 발생")
    void createNotice_throws_whenPopupNotFound() {
        // given
        Long sellerId = 1L;
        Long popupId = 10L;

        NoticeCreateRequest request = NoticeCreateRequest.builder()
            .popupId(popupId)
            .title("공지 제목")
            .content("공지 내용")
            .build();

        Users seller = mock(Users.class);
        when(userRepository.findById(sellerId)).thenReturn(Optional.of(seller));
        when(popupRepository.findById(popupId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> sellerNoticeService.createNotice(sellerId, request))
            .isInstanceOf(EntityNotFoundException.class)
            .hasMessageContaining("Popup not found");

        verify(userRepository).findById(sellerId);
        verify(popupRepository).findById(popupId);
        verify(announcementRepository, never()).save(any());
    }

    @Test
    @DisplayName("getNotices: 팝업이 존재하면 공지 페이지를 반환한다")
    void getNotices_returnsPage() {
        // given
        Long sellerId = 1L;
        Long popupId = 10L;

        Popup popup = mock(Popup.class);
        when(popupRepository.findById(popupId)).thenReturn(Optional.of(popup));

        var pageable = PageRequest.of(0, 10);

        Announcement announcement = mock(Announcement.class);

        when(announcement.getId()).thenReturn(100L);
        when(announcement.getPopup()).thenReturn(popup);
        when(popup.getId()).thenReturn(popupId);
        when(announcement.getTitle()).thenReturn("공지 제목");
        when(announcement.getContent()).thenReturn("공지 내용");
        when(announcement.getCreatedAt()).thenReturn(LocalDateTime.now());

        Page<Announcement> page =
            new PageImpl<>(List.of(announcement), pageable, 1);

        when(announcementRepository.findByPopupIdOrderByCreatedAtDesc(popupId, pageable))
            .thenReturn(page);

        // when
        var resultPage = sellerNoticeService.getNotices(sellerId, popupId, pageable);

        // then
        assertThat(resultPage.getTotalElements()).isEqualTo(1);
        assertThat(resultPage.getContent()).hasSize(1);

        NoticeResponse response = resultPage.getContent().get(0);
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getPopupId()).isEqualTo(popupId);
        assertThat(response.getTitle()).isEqualTo("공지 제목");

        verify(popupRepository).findById(popupId);
        verify(announcementRepository).findByPopupIdOrderByCreatedAtDesc(popupId, pageable);
    }

    @Test
    @DisplayName("getNotices: 팝업이 없으면 EntityNotFoundException 발생")
    void getNotices_throws_whenPopupNotFound() {
        // given
        Long sellerId = 1L;
        Long popupId = 10L;

        when(popupRepository.findById(popupId)).thenReturn(Optional.empty());

        var pageable = PageRequest.of(0, 10);

        // when & then
        assertThatThrownBy(() -> sellerNoticeService.getNotices(sellerId, popupId, pageable))
            .isInstanceOf(EntityNotFoundException.class)
            .hasMessageContaining("Popup not found");

        verify(popupRepository).findById(popupId);
        verify(announcementRepository, never()).findByPopupIdOrderByCreatedAtDesc(any(), any());
    }
}
