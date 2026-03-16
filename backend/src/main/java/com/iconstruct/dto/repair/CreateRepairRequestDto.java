package com.iconstruct.dto.repair;

import com.iconstruct.domain.UrgencyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateRepairRequestDto {

    @NotNull
    private Long categoryId;

    @NotBlank
    private String problemType;

    private String problemDescription;

    @NotNull
    private UrgencyLevel urgencyLevel;

    @NotBlank
    private String city;

    @NotBlank
    private String zone;

    private String address;

    private LocalDate preferredDate;

    private String preferredTimeSlot;

    private BigDecimal estimatedBudget;

    private Boolean needsInspection;

    private Boolean clientProvidesParts;

    private List<String> mediaUrls;
}
