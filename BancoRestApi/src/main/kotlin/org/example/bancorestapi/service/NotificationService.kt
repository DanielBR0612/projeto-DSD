package org.example.bancorestapi.service

import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import com.fasterxml.jackson.databind.ObjectMapper
import java.math.BigDecimal
import java.time.Instant
import java.util.logging.Logger

@Service
class NotificationService {

    @Autowired
    private lateinit var rabbitTemplate: RabbitTemplate

    @Autowired
    private lateinit var restTemplate: RestTemplate

    private val objectMapper = ObjectMapper()
    private val logger = Logger.getLogger(NotificationService::class.java.name)

    /**
     * Publica notificação de transferência na fila RabbitMQ
     */
    fun publishTransferenceNotification(destinatarioId: Long, valor: BigDecimal, tipo: String) {
        try {
            val notification = mapOf(
                "destinatarioId" to destinatarioId.toString(),
                "valor" to valor,
                "tipo" to tipo,
                "timestamp" to Instant.now().toString()
            )

            // Publica na fila
            rabbitTemplate.convertAndSend(
                "notificacoes.transferencias",
                objectMapper.writeValueAsString(notification)
            )

            logger.info("[RabbitMQ] Notificação enfileirada para: $destinatarioId")

            // Tenta também enviar direto para ws-service (fallback rápido)
            notifyWebSocketService(notification)

        } catch (e: Exception) {
            logger.severe("[NotificationService] Erro ao publicar: ${e.message}")
            e.printStackTrace()
        }
    }

    /**
     * Tenta notificar diretamente o ws-service (para clientes online)
     */
    private fun notifyWebSocketService(notification: Map<String, Any>) {
        try {
            val headers = HttpHeaders()
            headers.contentType = MediaType.APPLICATION_JSON

            val request = HttpEntity(notification, headers)

            restTemplate.postForObject(
                "http://localhost:8083/notify",
                request,
                String::class.java
            )

            logger.info("[WebSocket] Notificação enviada direto para ws-service")

        } catch (e: Exception) {
            logger.info("[WebSocket] Cliente offline - mantendo na fila: ${e.message}")
        }
    }
}
