package org.example.bancorestapi.dto

import java.math.BigDecimal
import java.time.LocalDateTime

data class ExtratoDTO(
    val valor: BigDecimal,
    val tipo: String,
    val dataHora: LocalDateTime
)