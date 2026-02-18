package com.iconstruct.repository;

import com.iconstruct.domain.User;
import com.iconstruct.domain.UserType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByUserType(UserType userType);

    @Query("SELECT u FROM User u JOIN u.categories c JOIN u.zones z " +
           "WHERE u.userType = 'PROFESSIONAL' " +
           "AND c.id = :categoryId " +
           "AND z = :zone " +
           "AND u.isActive = true")
    List<User> findEligibleProfessionals(
        @Param("categoryId") Long categoryId,
        @Param("zone") String zone
    );
}
