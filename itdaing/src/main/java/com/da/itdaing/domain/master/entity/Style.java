package com.da.itdaing.domain.master.entity;

import com.da.itdaing.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 스타일 마스터 데이터
 * - 사용자/팝업 선호 스타일 분류
 */
@Entity
@Table(name = "style")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Style extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 100, nullable = false, unique = true)
    private String name;

    @Builder
    public Style(String name) {
        this.name = name;
    }
}
