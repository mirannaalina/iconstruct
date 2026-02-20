package com.iconstruct.dto.repair;

import com.iconstruct.domain.UrgencyLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateRepairRequestDto {

    @NotNull
    private Long categoryId;

    @NotBlank
    private String problemType;

    private String problemDescription;

    @NotNull
    private UrgencyLevel urgency;

    @NotBlank
    private String city;

    @NotBlank
    private String zone;

    private String exactAddress;

    private List<String> mediaUrls;

    private LocalDateTime scheduledDate; // For SCHEDULED urgency
}
