package com.da.itdaing.domain.master;

import com.da.itdaing.domain.master.entity.Region;
import com.da.itdaing.domain.master.repository.RegionRepository;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class RegionRepositoryTest {

    @Autowired
    private RegionRepository regionRepository;

    @Test
    void 지역을_저장하고_조회할_수_있다() {
        // given
        Region region = Region.builder()
                .name("남구")
                .build();

        // when
        Region saved = regionRepository.save(region);
        Region found = regionRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getName()).isEqualTo("남구");
        assertThat(found.getCreatedAt()).isNotNull();
    }
}
