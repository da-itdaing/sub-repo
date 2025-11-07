package com.da.itdaing.domain.social;

import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.geo.ZoneArea;
import com.da.itdaing.domain.geo.ZoneAreaRepository;
import com.da.itdaing.domain.geo.ZoneCell;
import com.da.itdaing.domain.geo.ZoneCellRepository;
import com.da.itdaing.domain.master.Region;
import com.da.itdaing.domain.master.RegionRepository;
import com.da.itdaing.domain.popup.Popup;
import com.da.itdaing.domain.popup.PopupRepository;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@JpaSliceTest
class WishlistRepositoryTest {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PopupRepository popupRepository;

    @Autowired
    private ZoneCellRepository zoneCellRepository;

    @Autowired
    private ZoneAreaRepository zoneAreaRepository;

    @Autowired
    private RegionRepository regionRepository;

    @Test
    void 위시리스트를_저장하고_조회할_수_있다() {
        // given
        Users user = Users.builder()
                .loginId("user1")
                .password("pass")
                .email("user1@example.com")
                .role(UserRole.CONSUMER)
                .build();
        userRepository.save(user);

        Users seller = Users.builder()
                .loginId("seller1")
                .password("pass")
                .email("seller1@example.com")
                .role(UserRole.SELLER)
                .build();
        userRepository.save(seller);

        Region region = Region.builder().name("남구").build();
        regionRepository.save(region);

        ZoneArea zoneArea = ZoneArea.builder()
                .region(region)
                .name("송암동 상권")
                .build();
        zoneAreaRepository.save(zoneArea);

        ZoneCell zoneCell = ZoneCell.builder()
                .zoneArea(zoneArea)
                .label("A-1")
                .build();
        zoneCellRepository.save(zoneCell);

        Popup popup = Popup.builder()
                .seller(seller)
                .zoneCell(zoneCell)
                .name("팝업")
                .build();
        popupRepository.save(popup);

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .popup(popup)
                .build();

        // when
        Wishlist saved = wishlistRepository.save(wishlist);
        Wishlist found = wishlistRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getUser().getId()).isEqualTo(user.getId());
        assertThat(found.getPopup().getId()).isEqualTo(popup.getId());
        assertThat(found.getCreatedAt()).isNotNull();
    }

    @Test
    void 동일한_사용자와_팝업_조합은_중복_저장할_수_없다() {
        // given
        Users user = Users.builder()
                .loginId("user2")
                .password("pass")
                .email("user2@example.com")
                .role(UserRole.CONSUMER)
                .build();
        userRepository.save(user);

        Users seller = Users.builder()
                .loginId("seller2")
                .password("pass")
                .email("seller2@example.com")
                .role(UserRole.SELLER)
                .build();
        userRepository.save(seller);

        Region region = Region.builder().name("동구").build();
        regionRepository.save(region);

        ZoneArea zoneArea = ZoneArea.builder()
                .region(region)
                .name("충장로 상권")
                .build();
        zoneAreaRepository.save(zoneArea);

        ZoneCell zoneCell = ZoneCell.builder()
                .zoneArea(zoneArea)
                .label("B-1")
                .build();
        zoneCellRepository.save(zoneCell);

        Popup popup = Popup.builder()
                .seller(seller)
                .zoneCell(zoneCell)
                .name("팝업2")
                .build();
        popupRepository.save(popup);

        Wishlist wishlist1 = Wishlist.builder()
                .user(user)
                .popup(popup)
                .build();
        wishlistRepository.save(wishlist1);

        Wishlist wishlist2 = Wishlist.builder()
                .user(user)
                .popup(popup)
                .build();

        // when & then
        assertThatThrownBy(() -> {
            wishlistRepository.save(wishlist2);
            wishlistRepository.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }
}

