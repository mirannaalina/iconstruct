package com.iconstruct.dto.offer;

import com.iconstruct.domain.PartsOption;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateOfferDto {

    @NotNull
    @Positive
    private BigDecimal laborPrice;

    private BigDecimal partsPrice;

    private PartsOption partsOption = PartsOption.PROFESSIONAL_BRINGS;

    private String partsDescription;

    private Integer estimatedDurationMinutes;

    private String notes;
}
