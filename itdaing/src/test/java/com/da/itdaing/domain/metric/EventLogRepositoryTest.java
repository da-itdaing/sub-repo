package com.da.itdaing.domain.metric;

import com.da.itdaing.domain.common.enums.EventAction;
import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.geo.entity.ZoneArea;
import com.da.itdaing.domain.geo.repository.ZoneAreaRepository;
import com.da.itdaing.domain.geo.entity.ZoneCell;
import com.da.itdaing.domain.geo.repository.ZoneCellRepository;
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.domain.metric.entity.EventLog;
import com.da.itdaing.domain.metric.repository.EventLogRepository;
import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.repository.PopupRepository;
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
                .owner(seller)
                .label("A-1")
                .lat(35.1234)
                .lng(126.9876)
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

