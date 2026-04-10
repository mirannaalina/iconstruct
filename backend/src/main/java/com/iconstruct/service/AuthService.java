package com.iconstruct.service;

import com.iconstruct.domain.Category;
import com.iconstruct.domain.User;
import com.iconstruct.domain.UserType;
import com.iconstruct.dto.auth.AuthResponse;
import com.iconstruct.dto.auth.LoginRequest;
import com.iconstruct.dto.auth.RegisterRequest;
import com.iconstruct.repository.CategoryRepository;
import com.iconstruct.repository.UserRepository;
import com.iconstruct.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final AnafService anafService;

    public AuthService(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            AuthenticationManager authenticationManager,
            AnafService anafService) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
        this.anafService = anafService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Există deja un cont cu acest email");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .userType(request.getUserType())
                .isVerified(false)
                .isActive(true)
                .totalReviews(0)
                .build();

        // For professionals, validate CUI and set additional fields
        if (request.getUserType() == UserType.PROFESSIONAL) {
            // Validate CUI with ANAF
            if (request.getCui() == null || request.getCui().trim().isEmpty()) {
                throw new RuntimeException("CUI-ul este obligatoriu pentru profesioniști");
            }

            // Check if CUI is already registered
            if (userRepository.existsByCui(request.getCui())) {
                throw new RuntimeException("Există deja un cont înregistrat cu acest CUI");
            }

            // Validate CUI with ANAF and get company info
            AnafService.CompanyInfo companyInfo = anafService.validateCui(request.getCui());

            if (!companyInfo.isActive()) {
                throw new RuntimeException("Firma cu CUI-ul " + request.getCui() + " nu este activă");
            }

            user.setCui(companyInfo.getCui());
            user.setCompanyName(companyInfo.getName());
            user.setCompanyAddress(companyInfo.getAddress());
            user.setDescription(request.getDescription());

            if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
                Set<Category> categories = new HashSet<>(categoryRepository.findAllById(request.getCategoryIds()));
                user.setCategories(categories);
            }

            if (request.getZones() != null) {
                user.setZones(request.getZones());
            }
        }

        user = userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .userType(user.getUserType())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = tokenProvider.generateToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .userType(user.getUserType())
                .build();
    }
}
