package com.da.itdaing.domain.popup;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPopup is a Querydsl query type for Popup
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPopup extends EntityPathBase<Popup> {

    private static final long serialVersionUID = -1697023624L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPopup popup = new QPopup("popup");

    public final com.da.itdaing.global.jpa.QBaseTimeEntity _super = new com.da.itdaing.global.jpa.QBaseTimeEntity(this);

    public final EnumPath<com.da.itdaing.domain.common.enums.ApprovalStatus> approvalStatus = createEnum("approvalStatus", com.da.itdaing.domain.common.enums.ApprovalStatus.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final StringPath description = createString("description");

    public final DatePath<java.time.LocalDate> endDate = createDate("endDate", java.time.LocalDate.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath name = createString("name");

    public final StringPath operatingTime = createString("operatingTime");

    public final StringPath rejectionReason = createString("rejectionReason");

    public final com.da.itdaing.domain.user.QUsers seller;

    public final DatePath<java.time.LocalDate> startDate = createDate("startDate", java.time.LocalDate.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public final NumberPath<Long> viewCount = createNumber("viewCount", Long.class);

    public final com.da.itdaing.domain.geo.QZoneCell zoneCell;

    public QPopup(String variable) {
        this(Popup.class, forVariable(variable), INITS);
    }

    public QPopup(Path<? extends Popup> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPopup(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPopup(PathMetadata metadata, PathInits inits) {
        this(Popup.class, metadata, inits);
    }

    public QPopup(Class<? extends Popup> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.seller = inits.isInitialized("seller") ? new com.da.itdaing.domain.user.QUsers(forProperty("seller")) : null;
        this.zoneCell = inits.isInitialized("zoneCell") ? new com.da.itdaing.domain.geo.QZoneCell(forProperty("zoneCell"), inits.get("zoneCell")) : null;
    }

}

