package com.da.itdaing.domain.popup.repository;

import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.entity.PopupCategory;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PopupCategoryRepository extends JpaRepository<PopupCategory, Long> {

    List<PopupCategory> findByPopupIdIn(Collection<Long> popupIds);

    List<PopupCategory> findByPopupId(Long popupId);

    @Modifying
    @Query("DELETE FROM PopupCategory pc WHERE pc.popup = :popup")
    void deleteByPopup(@Param("popup") Popup popup);
}
