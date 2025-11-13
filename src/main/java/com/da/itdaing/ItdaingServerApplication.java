package com.da.itdaing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan(basePackages = "com.da.itdaing")
public class ItdaingServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ItdaingServerApplication.class, args);
	}

}
