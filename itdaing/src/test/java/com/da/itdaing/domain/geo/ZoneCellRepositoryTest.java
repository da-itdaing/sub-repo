package com.da.itdaing.domain.geo;

import com.da.itdaing.domain.common.enums.AreaStatus;
import com.da.itdaing.domain.common.enums.UserRole;
import com.da.itdaing.domain.common.enums.ZoneStatus;
import com.da.itdaing.domain.geo.entity.ZoneArea;
import com.da.itdaing.domain.geo.entity.ZoneCell;
import com.da.itdaing.domain.geo.repository.ZoneAreaRepository;
import com.da.itdaing.domain.geo.repository.ZoneCellRepository;
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.domain.user.entity.Users;
import com.da.itdaing.domain.user.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class ZoneCellRepositoryTest {

    @Autowired ZoneCellRepository cellRepo;
    @Autowired ZoneAreaRepository areaRepo;
    @Autowired RegionRepository regionRepo;
    @Autowired UserRepository userRepo;

    private static final String POLY = """
        {"type":"Polygon","coordinates":[
          [[126.97,37.56],[126.98,37.56],[126.98,37.57],[126.97,37.57],[126.97,37.56]]
        ]}
        """;

    @Test
    @DisplayName("존 셀을 저장하고 조회할 수 있다 (owner/lat/lng 필수)")
    void save_and_find_zone_cell() {
        // given: Region, Area, Seller
        Region region = regionRepo.save(Region.builder().name("남구").build());

        ZoneArea area = areaRepo.save(ZoneArea.builder()
            .region(region)
            .name("A-구역")
            .polygonGeoJson(POLY)
            .status(AreaStatus.AVAILABLE)
            .build());

        Users seller = userRepo.save(Users.builder()
            .loginId("seller-t1")
            .password("nop-encode-ok-in-test")
            .name("박판매")
            .nickname("팝업왕")
            .email("seller-t1@example.com")
            .role(UserRole.SELLER) // 중요: OWNER_ID not null 만족
            .build());

        ZoneCell cell = ZoneCell.builder()
            .zoneArea(area)
            .owner(seller)              // 중요: OWNER not null
            .label("A-1")
            .detailedAddress("광주 남구 어딘가 101")
            .lat(37.5665)               // 중요: LAT not null
            .lng(126.9780)
            .status(ZoneStatus.PENDING) // 기본값이어도 명시해 둠
            .maxCapacity(50)
            .notice("전력 사용 제한")
            .build();

        // when
        ZoneCell saved = cellRepo.save(cell);

        // then
        ZoneCell found = cellRepo.findById(saved.getId()).orElseThrow();
        assertThat(found.getZoneArea().getId()).isEqualTo(area.getId());
        assertThat(found.getOwner().getId()).isEqualTo(seller.getId());
        assertThat(found.getLabel()).isEqualTo("A-1");
        assertThat(found.getLat()).isEqualTo(37.5665);
        assertThat(found.getStatus()).isEqualTo(ZoneStatus.PENDING);
    }

    @Test
    @DisplayName("구역별로 존 목록을 조회할 수 있다")
    void find_by_area_paging_like_service_uses() {
        // given
        Region region = regionRepo.save(Region.builder().name("동구").build());
        ZoneArea area = areaRepo.save(ZoneArea.builder()
            .region(region)
            .name("B-구역")
            .polygonGeoJson(POLY)
            .status(AreaStatus.AVAILABLE)
            .build());
        Users seller = userRepo.save(Users.builder()
            .loginId("seller-t2")
            .password("pw")
            .name("이판매")
            .nickname("굿즈장인")
            .email("seller-t2@example.com")
            .role(UserRole.SELLER)
            .build());

        for (int i = 1; i <= 3; i++) {
            cellRepo.save(ZoneCell.builder()
                .zoneArea(area)
                .owner(seller)
                .label("B-" + i)
                .lat(37.56 + i * 0.001)
                .lng(126.97 + i * 0.001)
                .status(ZoneStatus.APPROVED)
                .build());
        }

        // when
        List<ZoneCell> byArea = cellRepo.findByZoneArea_Id(area.getId(), org.springframework.data.domain.PageRequest.of(0, 10))
            .getContent();

        // then
        assertThat(byArea).hasSize(3);
        assertThat(byArea.get(0).getZoneArea().getName()).isEqualTo("B-구역");
    }
}
