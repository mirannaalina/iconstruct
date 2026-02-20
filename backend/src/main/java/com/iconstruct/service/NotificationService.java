package com.iconstruct.service;

import com.iconstruct.domain.RepairRequest;
import com.iconstruct.domain.User;
import com.iconstruct.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final UserRepository userRepository;

    public NotificationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void notifyEligibleProfessionals(RepairRequest request) {
        // Find professionals that match category and zone
        List<User> eligibleProfessionals = userRepository.findEligibleProfessionals(
                request.getCategory().getId(),
                request.getZone()
        );

        logger.info("Found {} eligible professionals for request {}",
                eligibleProfessionals.size(), request.getId());

        for (User professional : eligibleProfessionals) {
            sendPushNotification(
                    professional,
                    "Cerere nouă de reparație",
                    "O nouă cerere de " + request.getCategory().getName() + " în zona " + request.getZone()
            );
        }
    }

    public void notifyNewOffer(RepairRequest request) {
        sendPushNotification(
                request.getClient(),
                "Ofertă nouă primită",
                "Ai primit o ofertă pentru cererea ta de " + request.getCategory().getName()
        );
    }

    public void notifyOfferAccepted(User professional, RepairRequest request) {
        sendPushNotification(
                professional,
                "Ofertă acceptată!",
                "Clientul a acceptat oferta ta pentru " + request.getCategory().getName()
        );
    }

    public void notifyNewMessage(User recipient, String senderName) {
        sendPushNotification(
                recipient,
                "Mesaj nou",
                "Ai primit un mesaj de la " + senderName
        );
    }

    private void sendPushNotification(User user, String title, String body) {
        // TODO: Implement Firebase Cloud Messaging
        // For now, just log
        logger.info("Push notification to {}: {} - {}", user.getEmail(), title, body);

        if (user.getFcmToken() != null) {
            // Send via Firebase
            // firebaseMessaging.send(...)
        }
    }
}
