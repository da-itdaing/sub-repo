package com.da.itdaing.domain.social.service;

import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.repository.PopupRepository;
import com.da.itdaing.domain.social.entity.Wishlist;
import com.da.itdaing.domain.social.repository.WishlistRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.global.error.exception.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
class WishlistServiceTest {

    @Mock
    private WishlistRepository wishlistRepository;

    @Mock
    private PopupRepository popupRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private WishlistService wishlistService;

    @Test
    @DisplayName("addToWishlist: 유저/팝업이 존재하고 기존 위시가 없으면 새로 저장한다")
    void addToWishlist_saves_whenNotExists() {
        // given
        Long userId = 1L;
        Long popupId = 10L;

        Users user =  mock(Users.class);   // 엔티티 필드까지 체크 안 할 거라 빈 객체로 충분
        Popup popup = mock (Popup.class);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(popupRepository.findById(popupId)).thenReturn(Optional.of(popup));
        when(wishlistRepository.existsByPopupIdAndUserId(popupId, userId)).thenReturn(false);

        ArgumentCaptor<Wishlist> captor = ArgumentCaptor.forClass(Wishlist.class);

        // when
        wishlistService.addToWishlist(userId, popupId);

        // then
        verify(wishlistRepository).save(captor.capture());
        Wishlist saved = captor.getValue();

        assertThat(saved.getUser()).isSameAs(user);
        assertThat(saved.getPopup()).isSameAs(popup);
    }

    @Test
    @DisplayName("addToWishlist: 이미 위시에 있으면 save 호출하지 않는다")
    void addToWishlist_doNothing_whenAlreadyExists() {
        // given
        Long userId = 1L;
        Long popupId = 10L;

        Users user =  mock(Users.class);   // 엔티티 필드까지 체크 안 할 거라 빈 객체로 충분
        Popup popup = mock (Popup.class);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(popupRepository.findById(popupId)).thenReturn(Optional.of(popup));
        when(wishlistRepository.existsByPopupIdAndUserId(popupId, userId)).thenReturn(true);

        // when
        wishlistService.addToWishlist(userId, popupId);

        // then
        verify(wishlistRepository, never()).save(any());
    }

    @Test
    @DisplayName("addToWishlist: 유저가 없으면 EntityNotFoundException 발생")
    void addToWishlist_throws_whenUserNotFound() {
        // given
        Long userId = 1L;
        Long popupId = 10L;

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> wishlistService.addToWishlist(userId, popupId))
            .isInstanceOf(EntityNotFoundException.class)
            .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("addToWishlist: 팝업이 없으면 EntityNotFoundException 발생")
    void addToWishlist_throws_whenPopupNotFound() {
        // given
        Long userId = 1L;
        Long popupId = 10L;

        Users user =  mock(Users.class);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(popupRepository.findById(popupId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> wishlistService.addToWishlist(userId, popupId))
            .isInstanceOf(EntityNotFoundException.class)
            .hasMessageContaining("Popup not found");
    }

    @Test
    @DisplayName("removeFromWishlist: 위시가 있으면 삭제한다")
    void removeFromWishlist_deletes_whenExists() {
        // given
        Long userId = 1L;
        Long popupId = 10L;

        Wishlist wishlist = mock(Wishlist.class);
        when(wishlistRepository.findByPopupIdAndUserId(popupId, userId)).thenReturn(wishlist);

        // when
        wishlistService.removeFromWishlist(userId, popupId);

        // then
        verify(wishlistRepository).delete(wishlist);
    }

    @Test
    @DisplayName("removeFromWishlist: 위시가 없으면 조용히 넘어간다")
    void removeFromWishlist_doNothing_whenNotExists() {
        // given
        Long userId = 1L;
        Long popupId = 10L;

        when(wishlistRepository.findByPopupIdAndUserId(popupId, userId)).thenReturn(null);

        // when
        wishlistService.removeFromWishlist(userId, popupId);

        // then
        verify(wishlistRepository, never()).delete(any());
    }

    @Test
    @DisplayName("getMyWishlist: Repository에서 조회한 결과를 페이지로 반환한다")
    void getMyWishlist_returnsPage() {
        // given
        Long userId = 1L;
        var pageable = PageRequest.of(0, 10);

        Wishlist wishlist = mock(Wishlist.class);
        Popup popup = mock(Popup.class);

        when(wishlist.getPopup()).thenReturn(popup);
        // Popup 내부 필드는 상세 검증 안 하고, 변환이 잘 돌아가는지만 본다

        Page<Wishlist> wishlistPage =
            new PageImpl<>(List.of(wishlist), pageable, 1);

        when(wishlistRepository.findByUserIdWithPopup(userId, pageable))
            .thenReturn(wishlistPage);

        // when
        var result = wishlistService.getMyWishlist(userId, pageable);

        // then
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent()).hasSize(1);
        verify(wishlistRepository).findByUserIdWithPopup(userId, pageable);
    }
}
