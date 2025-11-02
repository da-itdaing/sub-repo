package com.da.itdaing.domain.master.mapper;

import com.da.itdaing.domain.master.Region;
import com.da.itdaing.domain.master.dto.RegionResponse;
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
public class RegionMapperImpl implements RegionMapper {

    @Override
    public RegionResponse toResponse(Region region) {
        if ( region == null ) {
            return null;
        }

        RegionResponse regionResponse = new RegionResponse();

        return regionResponse;
    }

    @Override
    public List<RegionResponse> toResponseList(List<Region> regions) {
        if ( regions == null ) {
            return null;
        }

        List<RegionResponse> list = new ArrayList<RegionResponse>( regions.size() );
        for ( Region region : regions ) {
            list.add( toResponse( region ) );
        }

        return list;
    }
}
