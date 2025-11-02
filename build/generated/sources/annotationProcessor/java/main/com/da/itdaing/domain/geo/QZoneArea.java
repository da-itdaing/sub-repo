package com.da.itdaing.domain.geo;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QZoneArea is a Querydsl query type for ZoneArea
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QZoneArea extends EntityPathBase<ZoneArea> {

    private static final long serialVersionUID = 1250815368L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QZoneArea zoneArea = new QZoneArea("zoneArea");

    public final com.da.itdaing.global.jpa.QBaseTimeEntity _super = new com.da.itdaing.global.jpa.QBaseTimeEntity(this);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final StringPath geometryData = createString("geometryData");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath name = createString("name");

    public final com.da.itdaing.domain.master.QRegion region;

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public QZoneArea(String variable) {
        this(ZoneArea.class, forVariable(variable), INITS);
    }

    public QZoneArea(Path<? extends ZoneArea> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QZoneArea(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QZoneArea(PathMetadata metadata, PathInits inits) {
        this(ZoneArea.class, metadata, inits);
    }

    public QZoneArea(Class<? extends ZoneArea> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.region = inits.isInitialized("region") ? new com.da.itdaing.domain.master.QRegion(forProperty("region")) : null;
    }

}

