package com.iconstruct.controller;

import com.iconstruct.dto.message.MessageResponseDto;
import com.iconstruct.dto.message.SendMessageDto;
import com.iconstruct.security.CurrentUser;
import com.iconstruct.security.UserPrincipal;
import com.iconstruct.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/request/{requestId}")
    public ResponseEntity<List<MessageResponseDto>> getMessages(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable Long requestId) {
        List<MessageResponseDto> messages = messageService.getMessagesForRequest(requestId, currentUser.getId());
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/request/{requestId}")
    public ResponseEntity<MessageResponseDto> sendMessage(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable Long requestId,
            @Valid @RequestBody SendMessageDto dto) {
        MessageResponseDto message = messageService.sendMessage(requestId, currentUser.getId(), dto.getContent());
        return ResponseEntity.ok(message);
    }

    @GetMapping("/request/{requestId}/unread-count")
    public ResponseEntity<Integer> getUnreadCount(
            @CurrentUser UserPrincipal currentUser,
            @PathVariable Long requestId) {
        int count = messageService.getUnreadCount(requestId, currentUser.getId());
        return ResponseEntity.ok(count);
    }
}
