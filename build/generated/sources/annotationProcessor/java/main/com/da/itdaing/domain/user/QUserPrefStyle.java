package com.da.itdaing.domain.user;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QUserPrefStyle is a Querydsl query type for UserPrefStyle
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QUserPrefStyle extends EntityPathBase<UserPrefStyle> {

    private static final long serialVersionUID = -592233390L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QUserPrefStyle userPrefStyle = new QUserPrefStyle("userPrefStyle");

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final com.da.itdaing.domain.master.QStyle style;

    public final QUsers user;

    public QUserPrefStyle(String variable) {
        this(UserPrefStyle.class, forVariable(variable), INITS);
    }

    public QUserPrefStyle(Path<? extends UserPrefStyle> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QUserPrefStyle(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QUserPrefStyle(PathMetadata metadata, PathInits inits) {
        this(UserPrefStyle.class, metadata, inits);
    }

    public QUserPrefStyle(Class<? extends UserPrefStyle> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.style = inits.isInitialized("style") ? new com.da.itdaing.domain.master.QStyle(forProperty("style")) : null;
        this.user = inits.isInitialized("user") ? new QUsers(forProperty("user")) : null;
    }

}

