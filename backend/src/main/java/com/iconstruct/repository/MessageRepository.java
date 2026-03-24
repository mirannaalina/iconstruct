package com.iconstruct.repository;

import com.iconstruct.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByRequestIdOrderByCreatedAtAsc(Long requestId);

    // Count unread messages for a user in a specific request
    int countByRequestIdAndSenderIdNotAndIsReadFalse(Long requestId, Long userId);
}
