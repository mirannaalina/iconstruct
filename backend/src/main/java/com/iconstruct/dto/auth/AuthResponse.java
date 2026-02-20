package com.iconstruct.dto.auth;

import com.iconstruct.domain.UserType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private UserType userType;
}
