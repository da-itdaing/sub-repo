package com.da.itdaing.domain.user.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QUserPrefFeature is a Querydsl query type for UserPrefFeature
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QUserPrefFeature extends EntityPathBase<UserPrefFeature> {

    private static final long serialVersionUID = 1431167118L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QUserPrefFeature userPrefFeature = new QUserPrefFeature("userPrefFeature");

    public final com.da.itdaing.global.jpa.QBaseTimeEntity _super = new com.da.itdaing.global.jpa.QBaseTimeEntity(this);

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final com.da.itdaing.domain.master.QFeature feature;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public final QUsers user;

    public QUserPrefFeature(String variable) {
        this(UserPrefFeature.class, forVariable(variable), INITS);
    }

    public QUserPrefFeature(Path<? extends UserPrefFeature> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QUserPrefFeature(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QUserPrefFeature(PathMetadata metadata, PathInits inits) {
        this(UserPrefFeature.class, metadata, inits);
    }

    public QUserPrefFeature(Class<? extends UserPrefFeature> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.feature = inits.isInitialized("feature") ? new com.da.itdaing.domain.master.QFeature(forProperty("feature")) : null;
        this.user = inits.isInitialized("user") ? new QUsers(forProperty("user")) : null;
    }

}

