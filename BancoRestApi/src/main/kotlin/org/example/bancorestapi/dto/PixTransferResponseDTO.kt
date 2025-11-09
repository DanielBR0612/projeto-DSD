package org.example.bancorestapi.dto

import java.math.BigDecimal

data class PixTransferResponseDTO(
    var status: String,
    var mensagem: String,
    var novoSaldoOrigem: BigDecimal
)
