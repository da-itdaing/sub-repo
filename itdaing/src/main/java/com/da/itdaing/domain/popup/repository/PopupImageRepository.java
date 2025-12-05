package com.da.itdaing.domain.popup.repository;

import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.entity.PopupImage;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PopupImageRepository extends JpaRepository<PopupImage, Long> {

    List<PopupImage> findByPopupIdIn(Collection<Long> popupIds);

    List<PopupImage> findByPopupId(Long popupId);

    @Modifying
    @Query("DELETE FROM PopupImage pi WHERE pi.popup = :popup")
    void deleteByPopup(@Param("popup") Popup popup);
}
