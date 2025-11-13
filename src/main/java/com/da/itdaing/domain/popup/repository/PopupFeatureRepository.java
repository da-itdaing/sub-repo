package com.da.itdaing.domain.popup.repository;

import com.da.itdaing.domain.popup.entity.PopupFeature;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PopupFeatureRepository extends JpaRepository<PopupFeature, Long> {

    List<PopupFeature> findByPopupIdIn(Collection<Long> popupIds);

    List<PopupFeature> findByPopupId(Long popupId);
}