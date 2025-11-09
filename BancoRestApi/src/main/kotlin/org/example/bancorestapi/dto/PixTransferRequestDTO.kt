package org.example.bancorestapi.dto

import java.math.BigDecimal

data class PixTransferRequestDTO (
    val numeroContaOrigem: String,
    val chaveDestino: String,
    val valor: BigDecimal
)