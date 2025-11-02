package com.da.itdaing.domain.metric;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QMetricDailyCategory is a Querydsl query type for MetricDailyCategory
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QMetricDailyCategory extends EntityPathBase<MetricDailyCategory> {

    private static final long serialVersionUID = 1463802523L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QMetricDailyCategory metricDailyCategory = new QMetricDailyCategory("metricDailyCategory");

    public final com.da.itdaing.domain.master.QCategory category;

    public final NumberPath<Integer> clicks = createNumber("clicks", Integer.class);

    public final DatePath<java.time.LocalDate> date = createDate("date", java.time.LocalDate.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public QMetricDailyCategory(String variable) {
        this(MetricDailyCategory.class, forVariable(variable), INITS);
    }

    public QMetricDailyCategory(Path<? extends MetricDailyCategory> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QMetricDailyCategory(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QMetricDailyCategory(PathMetadata metadata, PathInits inits) {
        this(MetricDailyCategory.class, metadata, inits);
    }

    public QMetricDailyCategory(Class<? extends MetricDailyCategory> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.category = inits.isInitialized("category") ? new com.da.itdaing.domain.master.QCategory(forProperty("category")) : null;
    }

}

