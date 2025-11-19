package com.da.itdaing.domain.social.repository;

import com.da.itdaing.domain.social.entity.Wishlist;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    @Query("""
        select w
        from Wishlist w
        join fetch w.popup
        where w.user.id = :userId
        order by w.createdAt desc
        """)
    List<Wishlist> findByUserIdWithPopup(@Param("userId") Long userId);

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
}
