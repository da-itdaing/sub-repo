package com.da.itdaing.domain.popup.repository;

import com.da.itdaing.domain.popup.entity.Popup;
import com.da.itdaing.domain.popup.entity.PopupImage;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PopupImageRepository extends JpaRepository<PopupImage, Long> {

    List<PopupImage> findByPopupIdIn(Collection<Long> popupIds);

    List<PopupImage> findByPopupId(Long popupId);

    void deleteByPopup(Popup popup);
}
