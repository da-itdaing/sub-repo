package com.da.itdaing.domain.master.entity;

import com.da.itdaing.domain.common.enums.CategoryType;
import com.da.itdaing.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 카테고리 마스터 데이터
 */
@Entity
@Table(
    name = "category",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_category_type_name",
        columnNames = {"type", "name"}
    )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 20, nullable = false)
    private CategoryType type = CategoryType.POPUP;

    @Builder
    public Category(String name, CategoryType type) {
        this.name = name;
        this.type = type != null ? type : CategoryType.POPUP;
    }
}
