package com.da.itdaing.domain.social.repository;

import com.da.itdaing.domain.social.entity.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    // 대시보드 등에서 "내가 좋아요한 팝업 id들" 조회할 때 사용 (기존 코드용)
    @Query("""
        select w
        from Wishlist w
        join fetch w.popup
        where w.user.id = :userId
        order by w.createdAt desc
        """)
    List<Wishlist> findByUserIdWithPopup(@Param("userId") Long userId);

    // 위시 리스트 페이지 조회용
    @Query("""
        select w
        from Wishlist w
        join fetch w.popup
        where w.user.id = :userId
        order by w.createdAt desc
        """)
    Page<Wishlist> findByUserIdWithPopup(
        @Param("userId") Long userId,
        Pageable pageable
    );

    // 팝업별 좋아요 수 집계용
    @Query("""
        select w.popup.id as popupId, count(w.id) as count
        from Wishlist w
        where w.popup.id in :popupIds
        group by w.popup.id
        """)
    List<PopupFavoriteCount> countByPopupIds(@Param("popupIds") Collection<Long> popupIds);

    interface PopupFavoriteCount {
        Long getPopupId();
        long getCount();
    }

    // 개별 위시 여부 확인 (likedByMe, 중복 방지용)
    boolean existsByPopupIdAndUserId(Long popupId, Long userId);

    // 삭제용
    Wishlist findByPopupIdAndUserId(Long popupId, Long userId);

    // 현재 유저가 여러 팝업 중 어떤 것들을 좋아요했는지 한 번에 조회 (likedByMe 계산용)
    @Query("""
        select w
        from Wishlist w
        join fetch w.popup
        where w.user.id = :userId
          and w.popup.id in :popupIds
        """)
    List<Wishlist> findByUserIdAndPopupIdInWithPopup(
        @Param("userId") Long userId,
        @Param("popupIds") Collection<Long> popupIds
    );
}
