package com.da.itdaing.domain.user.entity;

import com.da.itdaing.domain.master.entity.Feature;
import com.da.itdaing.global.jpa.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/** 사용자 선호 편의사항 (M:N) */
@Entity
@Table(
    name = "user_pref_feature",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_user_feature",
        columnNames = {"user_id", "feature_id"}
    )
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserPrefFeature extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "feature_id", nullable = false)
    private Feature feature;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public UserPrefFeature(Users user, Feature feature) {
        this.user = user;
        this.feature = feature;
    }
}
