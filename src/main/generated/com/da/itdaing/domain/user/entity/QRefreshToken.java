package com.da.itdaing.domain.user.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QRefreshToken is a Querydsl query type for RefreshToken
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QRefreshToken extends EntityPathBase<RefreshToken> {

    private static final long serialVersionUID = -880449640L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QRefreshToken refreshToken = new QRefreshToken("refreshToken");

    public final StringPath deviceId = createString("deviceId");

    public final DateTimePath<java.time.Instant> expiresAt = createDateTime("expiresAt", java.time.Instant.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath ip = createString("ip");

    public final DateTimePath<java.time.Instant> issuedAt = createDateTime("issuedAt", java.time.Instant.class);

    public final StringPath replacedBy = createString("replacedBy");

    public final BooleanPath revoked = createBoolean("revoked");

    public final StringPath tokenHash = createString("tokenHash");

    public final QUsers user;

    public final StringPath userAgent = createString("userAgent");

    public QRefreshToken(String variable) {
        this(RefreshToken.class, forVariable(variable), INITS);
    }

    public QRefreshToken(Path<? extends RefreshToken> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QRefreshToken(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QRefreshToken(PathMetadata metadata, PathInits inits) {
        this(RefreshToken.class, metadata, inits);
    }

    public QRefreshToken(Class<? extends RefreshToken> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.user = inits.isInitialized("user") ? new QUsers(forProperty("user")) : null;
    }

}

