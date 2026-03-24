package com.iconstruct.dto.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class MessageResponseDto {
    private Long id;
    private Long senderId;
    private String senderName;
    private String content;
    private LocalDateTime createdAt;
}
