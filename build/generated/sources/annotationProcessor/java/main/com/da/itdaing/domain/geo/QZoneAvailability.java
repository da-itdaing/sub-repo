package com.da.itdaing.domain.geo;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QZoneAvailability is a Querydsl query type for ZoneAvailability
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QZoneAvailability extends EntityPathBase<ZoneAvailability> {

    private static final long serialVersionUID = 1017972566L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QZoneAvailability zoneAvailability = new QZoneAvailability("zoneAvailability");

    public final com.da.itdaing.global.jpa.QBaseTimeEntity _super = new com.da.itdaing.global.jpa.QBaseTimeEntity(this);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final NumberPath<java.math.BigDecimal> dailyPrice = createNumber("dailyPrice", java.math.BigDecimal.class);

    public final DatePath<java.time.LocalDate> endDate = createDate("endDate", java.time.LocalDate.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final NumberPath<Integer> maxConcurrentSlots = createNumber("maxConcurrentSlots", Integer.class);

    public final DatePath<java.time.LocalDate> startDate = createDate("startDate", java.time.LocalDate.class);

    public final StringPath status = createString("status");

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public final QZoneCell zoneCell;

    public QZoneAvailability(String variable) {
        this(ZoneAvailability.class, forVariable(variable), INITS);
    }

    public QZoneAvailability(Path<? extends ZoneAvailability> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QZoneAvailability(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QZoneAvailability(PathMetadata metadata, PathInits inits) {
        this(ZoneAvailability.class, metadata, inits);
    }

    public QZoneAvailability(Class<? extends ZoneAvailability> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.zoneCell = inits.isInitialized("zoneCell") ? new QZoneCell(forProperty("zoneCell"), inits.get("zoneCell")) : null;
    }

}

