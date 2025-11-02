package com.da.itdaing.domain.user;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QConsumerProfile is a Querydsl query type for ConsumerProfile
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QConsumerProfile extends EntityPathBase<ConsumerProfile> {

    private static final long serialVersionUID = 163479458L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QConsumerProfile consumerProfile = new QConsumerProfile("consumerProfile");

    public final com.da.itdaing.global.jpa.QBaseTimeEntity _super = new com.da.itdaing.global.jpa.QBaseTimeEntity(this);

    public final NumberPath<Integer> ageGroup = createNumber("ageGroup", Integer.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public final QUsers user;

    public final NumberPath<Long> userId = createNumber("userId", Long.class);

    public QConsumerProfile(String variable) {
        this(ConsumerProfile.class, forVariable(variable), INITS);
    }

    public QConsumerProfile(Path<? extends ConsumerProfile> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QConsumerProfile(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QConsumerProfile(PathMetadata metadata, PathInits inits) {
        this(ConsumerProfile.class, metadata, inits);
    }

    public QConsumerProfile(Class<? extends ConsumerProfile> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.user = inits.isInitialized("user") ? new QUsers(forProperty("user")) : null;
    }

}

