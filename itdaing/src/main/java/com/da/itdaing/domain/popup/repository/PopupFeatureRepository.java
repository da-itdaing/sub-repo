package com.da.itdaing.domain.popup.repository;

import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.entity.PopupFeature;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PopupFeatureRepository extends JpaRepository<PopupFeature, Long> {

    List<PopupFeature> findByPopupIdIn(Collection<Long> popupIds);

    List<PopupFeature> findByPopupId(Long popupId);

    @Modifying
    @Query("DELETE FROM PopupFeature pf WHERE pf.popup = :popup")
    void deleteByPopup(@Param("popup") Popup popup);
}
