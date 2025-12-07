package org.example.bancorestapi.config

import org.springframework.amqp.core.Queue
import org.springframework.amqp.core.DirectExchange
import org.springframework.amqp.core.Binding
import org.springframework.amqp.core.BindingBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RabbitMqConfig {

    companion object {
        const val NOTIFICATION_QUEUE = "notificacoes.transferencias"
        const val DEAD_LETTER_QUEUE = "notificacoes.transferencias.dlq"
        const val DLX_EXCHANGE = "notificacoes.dlx"
    }

    // Fila principal com Dead Letter
    @Bean
    fun notificationQueue(): Queue {
        return Queue(NOTIFICATION_QUEUE, true, false, false, mapOf(
            "x-dead-letter-exchange" to DLX_EXCHANGE,
            "x-dead-letter-routing-key" to DEAD_LETTER_QUEUE,
            "x-message-ttl" to 86400000  // 24 horas
        ))
    }

    // Dead Letter Exchange
    @Bean
    fun dlxExchange(): DirectExchange {
        return DirectExchange(DLX_EXCHANGE, true, false)
    }

    // Dead Letter Queue
    @Bean
    fun deadLetterQueue(): Queue {
        return Queue(DEAD_LETTER_QUEUE, true)
    }

    // Binding entre DLX e DLQ
    @Bean
    fun deadLetterBinding(): Binding {
        return BindingBuilder.bind(deadLetterQueue())
            .to(dlxExchange())
            .with(DEAD_LETTER_QUEUE)
    }
}
