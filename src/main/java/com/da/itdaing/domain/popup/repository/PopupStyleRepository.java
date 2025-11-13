package com.da.itdaing.domain.popup.repository;

import com.da.itdaing.domain.popup.entity.PopupStyle;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PopupStyleRepository extends JpaRepository<PopupStyle, Long> {

    List<PopupStyle> findByPopupIdIn(Collection<Long> popupIds);

    List<PopupStyle> findByPopupId(Long popupId);
}

