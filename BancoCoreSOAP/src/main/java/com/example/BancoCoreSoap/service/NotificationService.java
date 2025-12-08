package com.example.BancoCoreSoap.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;
import java.time.Instant; // Importante

@Service
public class NotificationService {

    private static final Logger logger = Logger.getLogger(NotificationService.class.getName());

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Publica notificação de transferência na fila RabbitMQ
    public void publishTransferenceNotification(String destinatarioId, java.math.BigDecimal valor, String tipo) {
        try {
            Map<String, Object> notification = new HashMap<>();
            
            notification.put("contaDestino", destinatarioId);
            notification.put("destinatarioId", destinatarioId); // Mantém compatibilidade
            
            notification.put("valor", valor);
            notification.put("tipo", tipo);
            
            notification.put("timestamp", Instant.now().toString());

            // Envia para a fila (RabbitMQ)
            rabbitTemplate.convertAndSend(
                "notificacoes.transferencias",
                objectMapper.writeValueAsString(notification)
            );

            logger.info("[RabbitMQ] Notificação enfileirada para: " + destinatarioId);

            // Tenta também enviar direto para ws-service (fallback rápido)
            notifyWebSocketService(notification);

        } catch (Exception e) {
            logger.severe("[NotificationService] Erro ao publicar: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Notificação direta ao ws-service (para clientes online)
    private void notifyWebSocketService(Map<String, Object> notification) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(notification, headers);
            
            restTemplate.postForObject(
                "http://ws-service:8083/notify", 
                request,
                String.class
            );

            logger.info("[WebSocket] Notificação enviada direto para ws-service");

        } catch (Exception e) {
            // Log alterado para info, pois se falhar aqui, o RabbitMQ garante a entrega
            logger.info("[WebSocket] Tentativa direta falhou (o RabbitMQ vai tratar): " + e.getMessage());
        }
    }
}