package com.da.itdaing.domain.popup;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPopupCategory is a Querydsl query type for PopupCategory
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPopupCategory extends EntityPathBase<PopupCategory> {

    private static final long serialVersionUID = -1857969514L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPopupCategory popupCategory = new QPopupCategory("popupCategory");

    public final com.da.itdaing.domain.master.QCategory category;

    public final StringPath categoryRole = createString("categoryRole");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final QPopup popup;

    public QPopupCategory(String variable) {
        this(PopupCategory.class, forVariable(variable), INITS);
    }

    public QPopupCategory(Path<? extends PopupCategory> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPopupCategory(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPopupCategory(PathMetadata metadata, PathInits inits) {
        this(PopupCategory.class, metadata, inits);
    }

    public QPopupCategory(Class<? extends PopupCategory> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.category = inits.isInitialized("category") ? new com.da.itdaing.domain.master.QCategory(forProperty("category")) : null;
        this.popup = inits.isInitialized("popup") ? new QPopup(forProperty("popup"), inits.get("popup")) : null;
    }

}

