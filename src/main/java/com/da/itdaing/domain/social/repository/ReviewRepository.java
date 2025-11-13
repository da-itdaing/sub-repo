package com.da.itdaing.domain.social.repository;

import com.da.itdaing.domain.social.entity.Review;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByPopupIdIn(Collection<Long> popupIds);

    List<Review> findByPopupId(Long popupId);
}
