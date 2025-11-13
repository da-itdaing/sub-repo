package com.da.itdaing.domain.master;

import com.da.itdaing.domain.master.entity.Category;
import com.da.itdaing.domain.master.repository.CategoryRepository;
import com.da.itdaing.testsupport.JpaSliceTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import static org.assertj.core.api.Assertions.assertThat;

@JpaSliceTest
class CategoryRepositoryTest {

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void 카테고리를_저장하고_조회할_수_있다() {
        // given
        Category category = Category.builder()
                .name("패션")
                .build();

        // when
        Category saved = categoryRepository.save(category);
        Category found = categoryRepository.findById(saved.getId()).orElseThrow();

        // then
        assertThat(found.getName()).isEqualTo("패션");
        assertThat(found.getCreatedAt()).isNotNull();
    }
}
