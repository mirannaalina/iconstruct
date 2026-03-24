package com.iconstruct.dto.message;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendMessageDto {

    @NotBlank
    private String content;
}
