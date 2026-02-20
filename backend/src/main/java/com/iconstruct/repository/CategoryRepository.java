package com.iconstruct.repository;

import com.iconstruct.domain.Category;
import com.iconstruct.domain.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByServiceType(ServiceType serviceType);

    List<Category> findByIsActiveTrue();

    List<Category> findByServiceTypeAndIsActiveTrue(ServiceType serviceType);
}
