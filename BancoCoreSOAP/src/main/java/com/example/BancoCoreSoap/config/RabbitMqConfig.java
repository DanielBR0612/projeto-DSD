package com.example.BancoCoreSoap.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    public static final String NOTIFICATION_QUEUE = "notificacoes.transferencias";
    public static final String DEAD_LETTER_QUEUE = "notificacoes.transferencias.dlq";
    public static final String DLX_EXCHANGE = "notificacoes.dlx";

    // Fila principal com Dead Letter
    @Bean
    public Queue notificationQueue() {
        return new Queue(NOTIFICATION_QUEUE, true, false, false,
            java.util.Map.of(
                "x-dead-letter-exchange", DLX_EXCHANGE,
                "x-dead-letter-routing-key", DEAD_LETTER_QUEUE,
                "x-message-ttl", 86400000  // 24 horas
            )
        );
    }

    // Dead Letter Exchange
    @Bean
    public DirectExchange dlxExchange() {
        return new DirectExchange(DLX_EXCHANGE, true, false);
    }

    // Dead Letter Queue
    @Bean
    public Queue deadLetterQueue() {
        return new Queue(DEAD_LETTER_QUEUE, true);
    }

    // Binding entre DLX e DLQ
    @Bean
    public Binding deadLetterBinding() {
        return BindingBuilder.bind(deadLetterQueue())
            .to(dlxExchange())
            .with(DEAD_LETTER_QUEUE);
    }
}
