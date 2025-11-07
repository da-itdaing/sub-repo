package com.da.itdaing.domain.popup;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QPopupStyle is a Querydsl query type for PopupStyle
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QPopupStyle extends EntityPathBase<PopupStyle> {

    private static final long serialVersionUID = -1866997991L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QPopupStyle popupStyle = new QPopupStyle("popupStyle");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    public final QPopup popup;

    public final com.da.itdaing.domain.master.QStyle style;

    public QPopupStyle(String variable) {
        this(PopupStyle.class, forVariable(variable), INITS);
    }

    public QPopupStyle(Path<? extends PopupStyle> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QPopupStyle(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QPopupStyle(PathMetadata metadata, PathInits inits) {
        this(PopupStyle.class, metadata, inits);
    }

    public QPopupStyle(Class<? extends PopupStyle> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.popup = inits.isInitialized("popup") ? new QPopup(forProperty("popup"), inits.get("popup")) : null;
        this.style = inits.isInitialized("style") ? new com.da.itdaing.domain.master.QStyle(forProperty("style")) : null;
    }

}

