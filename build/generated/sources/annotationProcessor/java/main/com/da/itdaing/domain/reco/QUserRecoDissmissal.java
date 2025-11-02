package com.da.itdaing.domain.reco;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QUserRecoDissmissal is a Querydsl query type for UserRecoDissmissal
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QUserRecoDissmissal extends EntityPathBase<UserRecoDissmissal> {

    private static final long serialVersionUID = 990448691L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QUserRecoDissmissal userRecoDissmissal = new QUserRecoDissmissal("userRecoDissmissal");

    public final com.da.itdaing.domain.user.QUsers consumer;

    public final DatePath<java.time.LocalDate> date = createDate("date", java.time.LocalDate.class);

    public final DateTimePath<java.time.LocalDateTime> dismissedAt = createDateTime("dismissedAt", java.time.LocalDateTime.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final com.da.itdaing.domain.popup.QPopup popup;

    public QUserRecoDissmissal(String variable) {
        this(UserRecoDissmissal.class, forVariable(variable), INITS);
    }

    public QUserRecoDissmissal(Path<? extends UserRecoDissmissal> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QUserRecoDissmissal(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QUserRecoDissmissal(PathMetadata metadata, PathInits inits) {
        this(UserRecoDissmissal.class, metadata, inits);
    }

    public QUserRecoDissmissal(Class<? extends UserRecoDissmissal> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.consumer = inits.isInitialized("consumer") ? new com.da.itdaing.domain.user.QUsers(forProperty("consumer")) : null;
        this.popup = inits.isInitialized("popup") ? new com.da.itdaing.domain.popup.QPopup(forProperty("popup"), inits.get("popup")) : null;
    }

}

