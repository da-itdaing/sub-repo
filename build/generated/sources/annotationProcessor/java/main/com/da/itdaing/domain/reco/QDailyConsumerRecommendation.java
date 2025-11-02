package com.da.itdaing.domain.reco;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QDailyConsumerRecommendation is a Querydsl query type for DailyConsumerRecommendation
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QDailyConsumerRecommendation extends EntityPathBase<DailyConsumerRecommendation> {

    private static final long serialVersionUID = -477227221L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QDailyConsumerRecommendation dailyConsumerRecommendation = new QDailyConsumerRecommendation("dailyConsumerRecommendation");

    public final com.da.itdaing.global.jpa.QBaseTimeEntity _super = new com.da.itdaing.global.jpa.QBaseTimeEntity(this);

    public final com.da.itdaing.domain.user.QUsers consumer;

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath modelVersion = createString("modelVersion");

    public final com.da.itdaing.domain.popup.QPopup popup;

    public final StringPath reasonJson = createString("reasonJson");

    public final DatePath<java.time.LocalDate> recommendationDate = createDate("recommendationDate", java.time.LocalDate.class);

    public final NumberPath<java.math.BigDecimal> score = createNumber("score", java.math.BigDecimal.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public QDailyConsumerRecommendation(String variable) {
        this(DailyConsumerRecommendation.class, forVariable(variable), INITS);
    }

    public QDailyConsumerRecommendation(Path<? extends DailyConsumerRecommendation> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QDailyConsumerRecommendation(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QDailyConsumerRecommendation(PathMetadata metadata, PathInits inits) {
        this(DailyConsumerRecommendation.class, metadata, inits);
    }

    public QDailyConsumerRecommendation(Class<? extends DailyConsumerRecommendation> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.consumer = inits.isInitialized("consumer") ? new com.da.itdaing.domain.user.QUsers(forProperty("consumer")) : null;
        this.popup = inits.isInitialized("popup") ? new com.da.itdaing.domain.popup.QPopup(forProperty("popup"), inits.get("popup")) : null;
    }

}

