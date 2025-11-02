package com.da.itdaing.domain.geo;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QZoneCell is a Querydsl query type for ZoneCell
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QZoneCell extends EntityPathBase<ZoneCell> {

    private static final long serialVersionUID = 1250862685L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QZoneCell zoneCell = new QZoneCell("zoneCell");

    public final com.da.itdaing.global.jpa.QBaseTimeEntity _super = new com.da.itdaing.global.jpa.QBaseTimeEntity(this);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final StringPath detailedAddress = createString("detailedAddress");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath label = createString("label");

    public final NumberPath<Double> lat = createNumber("lat", Double.class);

    public final NumberPath<Double> lng = createNumber("lng", Double.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public final QZoneArea zoneArea;

    public QZoneCell(String variable) {
        this(ZoneCell.class, forVariable(variable), INITS);
    }

    public QZoneCell(Path<? extends ZoneCell> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QZoneCell(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QZoneCell(PathMetadata metadata, PathInits inits) {
        this(ZoneCell.class, metadata, inits);
    }

    public QZoneCell(Class<? extends ZoneCell> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.zoneArea = inits.isInitialized("zoneArea") ? new QZoneArea(forProperty("zoneArea"), inits.get("zoneArea")) : null;
    }

}

