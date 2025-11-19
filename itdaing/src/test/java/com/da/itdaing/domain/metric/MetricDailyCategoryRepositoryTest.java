package com.da.itdaing.domain.metric;

import com.da.itdaing.domain.master.entity.Category;
import com.da.itdaing.domain.master.repository.CategoryRepository;
import com.da.itdaing.domain.metric.entity.MetricDailyCategory;
import com.da.itdaing.domain.metric.repository.MetricDailyCategoryRepository;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class MetricDailyCategoryRepositoryTest {

    @Autowired
    private MetricDailyCategoryRepository metricDailyCategoryRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void 카테고리_일일_메트릭을_저장하고_조회할_수_있다() {
        // given
        Category category = Category.builder()
            .name("패션")
            .build();
        categoryRepository.save(category);

        MetricDailyCategory metric = MetricDailyCategory.builder()
            .category(category)
            .date(LocalDate.of(2025, 11, 1))
            .clicks(250)
            .build();

        // when
        MetricDailyCategory saved = metricDailyCategoryRepository.save(metric);
        MetricDailyCategory found = metricDailyCategoryRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getCategory().getId()).isEqualTo(category.getId());
        assertThat(found.getDate()).isEqualTo(LocalDate.of(2025, 11, 1));
        assertThat(found.getClicks()).isEqualTo(250);
    }
}
