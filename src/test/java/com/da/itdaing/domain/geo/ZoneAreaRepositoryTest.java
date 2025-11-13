package com.da.itdaing.domain.geo;

import com.da.itdaing.domain.common.enums.AreaStatus;
import com.da.itdaing.domain.geo.entity.ZoneArea;
import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.domain.geo.repository.ZoneAreaRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class ZoneAreaRepositoryTest {

    @Autowired ZoneAreaRepository areaRepo;
    @Autowired RegionRepository regionRepo;

    private static final String POLY = """
        {"type":"Polygon","coordinates":[
          [[126.97,37.56],[126.98,37.56],[126.98,37.57],[126.97,37.57],[126.97,37.56]]
        ]}
        """;

    @Test
    @DisplayName("구역을 저장하고 조회할 수 있다")
    void save_and_find_zone_area() {
        // given
        Region region = regionRepo.save(Region.builder().name("남구").build());

        ZoneArea area = ZoneArea.builder()
            .region(region)
            .name("A-구역")
            .polygonGeoJson(POLY)
            .status(AreaStatus.AVAILABLE)
            .maxCapacity(120)
            .notice("소음 주의")
            .build();

        // when
        ZoneArea saved = areaRepo.save(area);
        ZoneArea found = areaRepo.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getId()).isNotNull();
        assertThat(found.getName()).isEqualTo("A-구역");
        assertThat(found.getPolygonGeoJson()).contains("\"Polygon\"");
        assertThat(found.getStatus()).isEqualTo(AreaStatus.AVAILABLE);
        assertThat(found.getRegion().getName()).isEqualTo("남구");
    }
}
