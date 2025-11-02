package com.da.itdaing.domain.master.mapper;

import com.da.itdaing.domain.master.Style;
import com.da.itdaing.domain.master.dto.StyleResponse;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-01T23:49:52+0900",
    comments = "version: 1.6.3, compiler: IncrementalProcessingEnvironment from gradle-language-java-8.14.3.jar, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class StyleMapperImpl implements StyleMapper {

    @Override
    public StyleResponse toResponse(Style style) {
        if ( style == null ) {
            return null;
        }

        StyleResponse styleResponse = new StyleResponse();

        return styleResponse;
    }

    @Override
    public List<StyleResponse> toResponseList(List<Style> styles) {
        if ( styles == null ) {
            return null;
        }

        List<StyleResponse> list = new ArrayList<StyleResponse>( styles.size() );
        for ( Style style : styles ) {
            list.add( toResponse( style ) );
        }

        return list;
    }
}
