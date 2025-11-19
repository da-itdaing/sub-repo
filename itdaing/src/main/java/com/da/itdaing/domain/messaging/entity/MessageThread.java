// src/main/java/com/da/itdaing/domain/messaging/entity/MessageThread.java
package com.da.itdaing.domain.messaging.entity;

import com.da.itdaing.domain.user.entity.Users;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "message_thread")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MessageThread {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "seller_id", nullable = false)
    private Users seller;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "admin_id")
    private Users admin; // 담당 관리자(배정 전엔 null 허용)

    @Column(length = 200, nullable = false)
    private String subject;

    private int unreadForSeller;
    private int unreadForAdmin;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /* ---- 정적 팩토리 (외부에서 new 금지) ---- */
    public static MessageThread create(Users seller, Users admin, String subject) {
        MessageThread t = new MessageThread();
        t.seller = seller;
        t.admin = admin;
        t.subject = subject;
        t.createdAt = LocalDateTime.now();
        t.updatedAt = t.createdAt;
        return t;
    }

    /* ---- 도메인 메서드 ---- */
    public void touchUpdatedAt() { this.updatedAt = LocalDateTime.now(); }
    public void incUnreadForSeller() { this.unreadForSeller++; }
    public void incUnreadForAdmin()  { this.unreadForAdmin++; }
    public void clearUnreadForSeller(){ this.unreadForSeller = 0; }
    public void clearUnreadForAdmin() { this.unreadForAdmin  = 0; }

    // ▼ 추가: 서비스에서 사용하는 세터(값 재집계 반영)
    //    public void setUnreadForSeller(int n) { this.unreadForSeller = Math.max(0, n); }
    //    public void setUnreadForAdmin(int n)  { this.unreadForAdmin  = Math.max(0, n); }

    // (대신 한 번에 바꾸고 싶다면)
    public void updateUnreadCounts(Integer forSeller, Integer forAdmin) {
        if (forSeller != null) this.unreadForSeller = Math.max(0, forSeller);
        if (forAdmin  != null) this.unreadForAdmin  = Math.max(0, forAdmin);
    }

    public void overrideTimestamps(LocalDateTime createdAt, LocalDateTime updatedAt) {
        if (createdAt != null) {
            this.createdAt = createdAt;
        }
        if (updatedAt != null) {
            this.updatedAt = updatedAt;
        }
    }
}
