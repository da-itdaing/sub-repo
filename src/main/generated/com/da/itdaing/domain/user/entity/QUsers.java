package com.da.itdaing.domain.user.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;


/**
 * QUsers is a Querydsl query type for Users
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QUsers extends EntityPathBase<Users> {

    private static final long serialVersionUID = -1527657586L;

    public static final QUsers users = new QUsers("users");

    public final com.da.itdaing.global.jpa.QBaseTimeEntity _super = new com.da.itdaing.global.jpa.QBaseTimeEntity(this);

    public final NumberPath<Integer> ageGroup = createNumber("ageGroup", Integer.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdAt = _super.createdAt;

    public final StringPath email = createString("email");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final StringPath loginId = createString("loginId");

    public final StringPath mbti = createString("mbti");

    public final StringPath name = createString("name");

    public final StringPath nickname = createString("nickname");

    public final StringPath password = createString("password");

    public final EnumPath<com.da.itdaing.domain.common.enums.UserRole> role = createEnum("role", com.da.itdaing.domain.common.enums.UserRole.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> updatedAt = _super.updatedAt;

    public QUsers(String variable) {
        super(Users.class, forVariable(variable));
    }

    public QUsers(Path<? extends Users> path) {
        super(path.getType(), path.getMetadata());
    }

    public QUsers(PathMetadata metadata) {
        super(Users.class, metadata);
    }

}

