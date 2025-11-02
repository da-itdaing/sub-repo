package com.da.itdaing.domain.master;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QFeature is a Querydsl query type for Feature
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QFeature extends EntityPathBase<Feature> {

    private static final long serialVersionUID = 1569560540L;

    public static final QFeature feature = new QFeature("feature");

    public final com.da.itdaing.global.jpa.QBaseTimeEntity _super = new com.da.itdaing.global.jpa.QBaseTimeEntity(this);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath name = createString("name");

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public QFeature(String variable) {
        super(Feature.class, forVariable(variable));
    }

    public QFeature(Path<? extends Feature> path) {
        super(path.getType(), path.getMetadata());
    }

    public QFeature(PathMetadata metadata) {
        super(Feature.class, metadata);
    }

}

