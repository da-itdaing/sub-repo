package com.da.itdaing.domain.popup.repository;

import com.da.itdaing.domain.popup.entity.PopupCategory;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PopupCategoryRepository extends JpaRepository<PopupCategory, Long> {

    List<PopupCategory> findByPopupIdIn(Collection<Long> popupIds);

    List<PopupCategory> findByPopupId(Long popupId);
}
