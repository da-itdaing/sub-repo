package com.da.itdaing.domain.metric;

import com.da.itdaing.domain.common.enums.EventAction;
import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.geo.ZoneArea;
import com.da.itdaing.domain.geo.ZoneAreaRepository;
import com.da.itdaing.domain.geo.ZoneCell;
import com.da.itdaing.domain.geo.ZoneCellRepository;
import com.da.itdaing.domain.master.Region;
import com.da.itdaing.domain.master.RegionRepository;
import com.da.itdaing.domain.popup.Popup;
import com.da.itdaing.domain.popup.PopupRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class EventLogRepositoryTest {

    @Autowired
    private EventLogRepository eventLogRepository;

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
    void 이벤트_로그를_저장하고_조회할_수_있다() {
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

        EventLog eventLog = EventLog.builder()
                .user(user)
                .popup(popup)
                .actionType(EventAction.VIEW)
                .build();

        // when
        EventLog saved = eventLogRepository.save(eventLog);
        EventLog found = eventLogRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getUser().getId()).isEqualTo(user.getId());
        assertThat(found.getPopup().getId()).isEqualTo(popup.getId());
        assertThat(found.getActionType()).isEqualTo(EventAction.VIEW);
        assertThat(found.getCreatedAt()).isNotNull();
    }
}

