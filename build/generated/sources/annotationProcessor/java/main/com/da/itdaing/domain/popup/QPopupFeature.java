package com.da.itdaing.domain.popup;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPopupFeature is a Querydsl query type for PopupFeature
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPopupFeature extends EntityPathBase<PopupFeature> {

    private static final long serialVersionUID = 2007269982L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPopupFeature popupFeature = new QPopupFeature("popupFeature");

    public final com.da.itdaing.domain.master.QFeature feature;

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final QPopup popup;

    public QPopupFeature(String variable) {
        this(PopupFeature.class, forVariable(variable), INITS);
    }

    public QPopupFeature(Path<? extends PopupFeature> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPopupFeature(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPopupFeature(PathMetadata metadata, PathInits inits) {
        this(PopupFeature.class, metadata, inits);
    }

    public QPopupFeature(Class<? extends PopupFeature> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.feature = inits.isInitialized("feature") ? new com.da.itdaing.domain.master.QFeature(forProperty("feature")) : null;
        this.popup = inits.isInitialized("popup") ? new QPopup(forProperty("popup"), inits.get("popup")) : null;
    }

}

