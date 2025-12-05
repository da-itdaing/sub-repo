package com.da.itdaing.domain.popup.repository;

import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.entity.PopupStyle;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PopupStyleRepository extends JpaRepository<PopupStyle, Long> {

    List<PopupStyle> findByPopupIdIn(Collection<Long> popupIds);

    List<PopupStyle> findByPopupId(Long popupId);

    @Modifying
    @Query("DELETE FROM PopupStyle ps WHERE ps.popup = :popup")
    void deleteByPopup(@Param("popup") Popup popup);
}
