package com.da.itdaing.domain.user;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QUserPrefRegion is a Querydsl query type for UserPrefRegion
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QUserPrefRegion extends EntityPathBase<UserPrefRegion> {

    private static final long serialVersionUID = -1222386573L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QUserPrefRegion userPrefRegion = new QUserPrefRegion("userPrefRegion");

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final com.da.itdaing.domain.master.QRegion region;

    public final QUsers user;

    public QUserPrefRegion(String variable) {
        this(UserPrefRegion.class, forVariable(variable), INITS);
    }

    public QUserPrefRegion(Path<? extends UserPrefRegion> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QUserPrefRegion(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QUserPrefRegion(PathMetadata metadata, PathInits inits) {
        this(UserPrefRegion.class, metadata, inits);
    }

    public QUserPrefRegion(Class<? extends UserPrefRegion> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.region = inits.isInitialized("region") ? new com.da.itdaing.domain.master.QRegion(forProperty("region")) : null;
        this.user = inits.isInitialized("user") ? new QUsers(forProperty("user")) : null;
    }

}

