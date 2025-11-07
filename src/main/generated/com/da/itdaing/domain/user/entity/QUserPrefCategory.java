package com.da.itdaing.domain.user.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QUserPrefCategory is a Querydsl query type for UserPrefCategory
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QUserPrefCategory extends EntityPathBase<UserPrefCategory> {

    private static final long serialVersionUID = 1757678182L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QUserPrefCategory userPrefCategory = new QUserPrefCategory("userPrefCategory");

    public final com.da.itdaing.global.jpa.QBaseTimeEntity _super = new com.da.itdaing.global.jpa.QBaseTimeEntity(this);

    public final com.da.itdaing.domain.master.QCategory category;

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public final QUsers user;

    public QUserPrefCategory(String variable) {
        this(UserPrefCategory.class, forVariable(variable), INITS);
    }

    public QUserPrefCategory(Path<? extends UserPrefCategory> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QUserPrefCategory(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QUserPrefCategory(PathMetadata metadata, PathInits inits) {
        this(UserPrefCategory.class, metadata, inits);
    }

    public QUserPrefCategory(Class<? extends UserPrefCategory> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.category = inits.isInitialized("category") ? new com.da.itdaing.domain.master.QCategory(forProperty("category")) : null;
        this.user = inits.isInitialized("user") ? new QUsers(forProperty("user")) : null;
    }

}

