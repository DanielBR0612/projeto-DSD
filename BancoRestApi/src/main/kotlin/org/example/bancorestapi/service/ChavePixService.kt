package org.example.bancorestapi.service

import org.example.bancorestapi.domain.ChavePix
import org.example.bancorestapi.domain.Conta
import org.example.bancorestapi.domain.TipoChave
import org.example.bancorestapi.dto.ChavePixRequestDTO
import org.example.bancorestapi.dto.ChavePixResponseDTO
import org.example.bancorestapi.repository.ChavePixRepository
import org.example.bancorestapi.repository.ContaRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ChavePixService (
    private val chavePixRepository: ChavePixRepository,
    private val contaRepository: ContaRepository
) {
    @Transactional
    fun create (clienteId: Long, request: ChavePixRequestDTO) : ChavePixResponseDTO {
        val newChavePix = ChavePix()
        newChavePix.chave = request.valor

        try {
            newChavePix.tipoChave = TipoChave.valueOf(request.tipo.uppercase())
        }   catch (e: IllegalArgumentException) {
            throw RuntimeException("Tipo de chave inválido: '${request.tipo}'")
        }

        val contaDaChave: Conta = contaRepository.findByNumeroConta(request.numeroConta)
            ?: throw RuntimeException("Conta '${request.numeroConta}' não foi encontrada.")

        val clienteIdDaConta = contaDaChave.cliente?.id ?: -1L

        if (clienteIdDaConta != clienteId) {
            throw RuntimeException("A Conta não pertence ao Cliente ID $clienteId.")
        }

        newChavePix.conta = contaDaChave

        val savedChave = chavePixRepository.save(newChavePix)

        return ChavePixResponseDTO (
            id = savedChave.id!!,
            tipo = savedChave.tipoChave.name,
            valor = savedChave.chave,
            numeroConta = savedChave.conta.numeroConta
        )
    }
}