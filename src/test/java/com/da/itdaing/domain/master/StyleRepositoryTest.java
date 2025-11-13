package com.da.itdaing.domain.master;

import com.da.itdaing.domain.master.entity.Style;
import com.da.itdaing.domain.master.repository.StyleRepository;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class StyleRepositoryTest {

    @Autowired
    private StyleRepository styleRepository;

    @Test
    void 스타일을_저장하고_조회할_수_있다() {
        // given
        Style style = Style.builder()
                .name("미니멀")
                .build();

        // when
        Style saved = styleRepository.save(style);
        Style found = styleRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getName()).isEqualTo("미니멀");
        assertThat(found.getCreatedAt()).isNotNull();
    }
}
