package com.iconstruct.service;

import com.iconstruct.domain.Message;
import com.iconstruct.domain.RepairRequest;
import com.iconstruct.domain.RequestStatus;
import com.iconstruct.domain.User;
import com.iconstruct.dto.message.MessageResponseDto;
import com.iconstruct.repository.MessageRepository;
import com.iconstruct.repository.RepairRequestRepository;
import com.iconstruct.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final RepairRequestRepository requestRepository;
    private final UserRepository userRepository;

    public MessageService(
            MessageRepository messageRepository,
            RepairRequestRepository requestRepository,
            UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
    }

    public List<MessageResponseDto> getMessagesForRequest(Long requestId, Long userId) {
        RepairRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Verify user is part of this conversation (client or accepted professional)
        boolean isClient = request.getClient().getId().equals(userId);
        boolean isProfessional = request.getAcceptedOffer() != null &&
                request.getAcceptedOffer().getProfessional().getId().equals(userId);

        if (!isClient && !isProfessional) {
            throw new RuntimeException("You don't have access to this conversation");
        }

        List<Message> messages = messageRepository.findByRequestIdOrderByCreatedAtAsc(requestId);

        // Mark messages from other party as read
        messages.stream()
                .filter(m -> !m.getSender().getId().equals(userId))
                .filter(m -> !Boolean.TRUE.equals(m.getIsRead()))
                .forEach(m -> {
                    m.setIsRead(true);
                    messageRepository.save(m);
                });

        return messages.stream()
                .map(m -> MessageResponseDto.builder()
                        .id(m.getId())
                        .senderId(m.getSender().getId())
                        .senderName(m.getSender().getFirstName() + " " + m.getSender().getLastName())
                        .content(m.getContent())
                        .createdAt(m.getCreatedAt())
                        .build())
                .toList();
    }

    public int getUnreadCount(Long requestId, Long userId) {
        return messageRepository.countByRequestIdAndSenderIdNotAndIsReadFalse(requestId, userId);
    }

    @Transactional
    public MessageResponseDto sendMessage(Long requestId, Long senderId, String content) {
        RepairRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify request is in progress (offer accepted)
        if (request.getStatus() != RequestStatus.IN_PROGRESS) {
            throw new RuntimeException("Can only send messages for requests in progress");
        }

        // Verify user is part of this conversation
        boolean isClient = request.getClient().getId().equals(senderId);
        boolean isProfessional = request.getAcceptedOffer() != null &&
                request.getAcceptedOffer().getProfessional().getId().equals(senderId);

        if (!isClient && !isProfessional) {
            throw new RuntimeException("You are not part of this conversation");
        }

        Message message = Message.builder()
                .request(request)
                .sender(sender)
                .content(content)
                .isRead(false)
                .build();

        message = messageRepository.save(message);

        return MessageResponseDto.builder()
                .id(message.getId())
                .senderId(sender.getId())
                .senderName(sender.getFirstName() + " " + sender.getLastName())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
