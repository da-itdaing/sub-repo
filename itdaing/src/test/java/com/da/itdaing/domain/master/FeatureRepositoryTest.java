package com.da.itdaing.domain.master;

import com.da.itdaing.domain.master.entity.Feature;
import com.da.itdaing.domain.master.repository.FeatureRepository;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class FeatureRepositoryTest {

    @Autowired
    private FeatureRepository featureRepository;

    @Test
    void 특징을_저장하고_조회할_수_있다() {
        // given
        Feature feature = Feature.builder()
                .name("무료 주차")
                .build();

        // when
        Feature saved = featureRepository.save(feature);
        Feature found = featureRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getName()).isEqualTo("무료 주차");
        assertThat(found.getCreatedAt()).isNotNull();
    }
}
