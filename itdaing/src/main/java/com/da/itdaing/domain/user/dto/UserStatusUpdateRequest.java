// src/main/java/com/da/itdaing/domain/user/dto/UserStatusUpdateRequest.java
package com.da.itdaing.domain.user.dto;


import com.da.itdaing.domain.common.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserStatusUpdateRequest {

    @NotNull
    private UserStatus status;
}
