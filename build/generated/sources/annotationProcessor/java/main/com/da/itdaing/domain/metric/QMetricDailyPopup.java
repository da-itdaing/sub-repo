package com.da.itdaing.domain.metric;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QMetricDailyPopup is a Querydsl query type for MetricDailyPopup
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QMetricDailyPopup extends EntityPathBase<MetricDailyPopup> {

    private static final long serialVersionUID = 1194229807L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QMetricDailyPopup metricDailyPopup = new QMetricDailyPopup("metricDailyPopup");

    public final DatePath<java.time.LocalDate> date = createDate("date", java.time.LocalDate.class);

    public final NumberPath<Integer> favorites = createNumber("favorites", Integer.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final com.da.itdaing.domain.popup.QPopup popup;

    public final NumberPath<Integer> reviews = createNumber("reviews", Integer.class);

    public final NumberPath<Integer> uniqueUsers = createNumber("uniqueUsers", Integer.class);

    public final NumberPath<Integer> views = createNumber("views", Integer.class);

    public QMetricDailyPopup(String variable) {
        this(MetricDailyPopup.class, forVariable(variable), INITS);
    }

    public QMetricDailyPopup(Path<? extends MetricDailyPopup> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QMetricDailyPopup(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QMetricDailyPopup(PathMetadata metadata, PathInits inits) {
        this(MetricDailyPopup.class, metadata, inits);
    }

    public QMetricDailyPopup(Class<? extends MetricDailyPopup> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.popup = inits.isInitialized("popup") ? new com.da.itdaing.domain.popup.QPopup(forProperty("popup"), inits.get("popup")) : null;
    }

}

