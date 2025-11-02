package com.da.itdaing.domain.metric;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QEventLog is a Querydsl query type for EventLog
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QEventLog extends EntityPathBase<EventLog> {

    private static final long serialVersionUID = -538442090L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QEventLog eventLog = new QEventLog("eventLog");

    public final EnumPath<com.da.itdaing.domain.common.enums.EventAction> actionType = createEnum("actionType", com.da.itdaing.domain.common.enums.EventAction.class);

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final com.da.itdaing.domain.popup.QPopup popup;

    public final com.da.itdaing.domain.user.QUsers user;

    public final com.da.itdaing.domain.geo.QZoneCell zoneCell;

    public QEventLog(String variable) {
        this(EventLog.class, forVariable(variable), INITS);
    }

    public QEventLog(Path<? extends EventLog> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QEventLog(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QEventLog(PathMetadata metadata, PathInits inits) {
        this(EventLog.class, metadata, inits);
    }

    public QEventLog(Class<? extends EventLog> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.popup = inits.isInitialized("popup") ? new com.da.itdaing.domain.popup.QPopup(forProperty("popup"), inits.get("popup")) : null;
        this.user = inits.isInitialized("user") ? new com.da.itdaing.domain.user.QUsers(forProperty("user")) : null;
        this.zoneCell = inits.isInitialized("zoneCell") ? new com.da.itdaing.domain.geo.QZoneCell(forProperty("zoneCell"), inits.get("zoneCell")) : null;
    }

}

