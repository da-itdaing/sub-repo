package com.da.itdaing.domain.master.mapper;

import com.da.itdaing.domain.master.Feature;
import com.da.itdaing.domain.master.dto.FeatureResponse;
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
public class FeatureMapperImpl implements FeatureMapper {

    @Override
    public FeatureResponse toResponse(Feature feature) {
        if ( feature == null ) {
            return null;
        }

        FeatureResponse featureResponse = new FeatureResponse();

        return featureResponse;
    }

    @Override
    public List<FeatureResponse> toResponseList(List<Feature> features) {
        if ( features == null ) {
            return null;
        }

        List<FeatureResponse> list = new ArrayList<FeatureResponse>( features.size() );
        for ( Feature feature : features ) {
            list.add( toResponse( feature ) );
        }

        return list;
    }
}
