package com.da.itdaing.domain.audit;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QApprovalRecord is a Querydsl query type for ApprovalRecord
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QApprovalRecord extends EntityPathBase<ApprovalRecord> {

    private static final long serialVersionUID = 526323225L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QApprovalRecord approvalRecord = new QApprovalRecord("approvalRecord");

    public final com.da.itdaing.domain.user.QUsers admin;

    public final DateTimePath<java.time.LocalDateTime> createdAt = createDateTime("createdAt", java.time.LocalDateTime.class);

    public final EnumPath<com.da.itdaing.domain.common.enums.DecisionType> decision = createEnum("decision", com.da.itdaing.domain.common.enums.DecisionType.class);

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath reason = createString("reason");

    public final NumberPath<Long> targetId = createNumber("targetId", Long.class);

    public final StringPath targetType = createString("targetType");

    public QApprovalRecord(String variable) {
        this(ApprovalRecord.class, forVariable(variable), INITS);
    }

    public QApprovalRecord(Path<? extends ApprovalRecord> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QApprovalRecord(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QApprovalRecord(PathMetadata metadata, PathInits inits) {
        this(ApprovalRecord.class, metadata, inits);
    }

    public QApprovalRecord(Class<? extends ApprovalRecord> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.admin = inits.isInitialized("admin") ? new com.da.itdaing.domain.user.QUsers(forProperty("admin")) : null;
    }

}

