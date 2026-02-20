package com.iconstruct.dto.auth;

import com.iconstruct.domain.UserType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class RegisterRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private String phoneNumber;

    @NotNull
    private UserType userType; // CLIENT or PROFESSIONAL

    // For professionals only
    private String companyName;
    private String description;
    private Set<Long> categoryIds; // Categories they work in
    private Set<String> zones; // Zones they cover (city/neighborhood)
}
