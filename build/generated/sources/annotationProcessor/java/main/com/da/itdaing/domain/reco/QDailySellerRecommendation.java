package com.da.itdaing.domain.reco;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QDailySellerRecommendation is a Querydsl query type for DailySellerRecommendation
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QDailySellerRecommendation extends EntityPathBase<DailySellerRecommendation> {

    private static final long serialVersionUID = 521881076L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QDailySellerRecommendation dailySellerRecommendation = new QDailySellerRecommendation("dailySellerRecommendation");

    public final com.da.itdaing.global.jpa.QBaseTimeEntity _super = new com.da.itdaing.global.jpa.QBaseTimeEntity(this);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath modelVersion = createString("modelVersion");

    public final StringPath reasonJson = createString("reasonJson");

    public final DatePath<java.time.LocalDate> recommendationDate = createDate("recommendationDate", java.time.LocalDate.class);

    public final NumberPath<java.math.BigDecimal> score = createNumber("score", java.math.BigDecimal.class);

    public final com.da.itdaing.domain.user.QUsers seller;

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public final com.da.itdaing.domain.geo.QZoneArea zoneArea;

    public QDailySellerRecommendation(String variable) {
        this(DailySellerRecommendation.class, forVariable(variable), INITS);
    }

    public QDailySellerRecommendation(Path<? extends DailySellerRecommendation> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QDailySellerRecommendation(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QDailySellerRecommendation(PathMetadata metadata, PathInits inits) {
        this(DailySellerRecommendation.class, metadata, inits);
    }

    public QDailySellerRecommendation(Class<? extends DailySellerRecommendation> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.seller = inits.isInitialized("seller") ? new com.da.itdaing.domain.user.QUsers(forProperty("seller")) : null;
        this.zoneArea = inits.isInitialized("zoneArea") ? new com.da.itdaing.domain.geo.QZoneArea(forProperty("zoneArea"), inits.get("zoneArea")) : null;
    }

}

