package com.da.itdaing.domain.metric;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QEventLogCategory is a Querydsl query type for EventLogCategory
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QEventLogCategory extends EntityPathBase<EventLogCategory> {

    private static final long serialVersionUID = -109563468L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QEventLogCategory eventLogCategory = new QEventLogCategory("eventLogCategory");

    public final EnumPath<com.da.itdaing.domain.common.enums.EventAction> actionType = createEnum("actionType", com.da.itdaing.domain.common.enums.EventAction.class);

    public final com.da.itdaing.domain.master.QCategory category;

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final com.da.itdaing.domain.user.QUsers user;

    public QEventLogCategory(String variable) {
        this(EventLogCategory.class, forVariable(variable), INITS);
    }

    public QEventLogCategory(Path<? extends EventLogCategory> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QEventLogCategory(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QEventLogCategory(PathMetadata metadata, PathInits inits) {
        this(EventLogCategory.class, metadata, inits);
    }

    public QEventLogCategory(Class<? extends EventLogCategory> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.category = inits.isInitialized("category") ? new com.da.itdaing.domain.master.QCategory(forProperty("category")) : null;
        this.user = inits.isInitialized("user") ? new com.da.itdaing.domain.user.QUsers(forProperty("user")) : null;
    }

}

