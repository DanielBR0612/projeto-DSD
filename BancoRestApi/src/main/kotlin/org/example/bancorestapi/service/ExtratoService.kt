package org.example.bancorestapi.service

import org.example.bancorestapi.dto.ExtratoDTO
import org.example.bancorestapi.repository.TransacaoRepository
import org.springframework.stereotype.Service

@Service
class ExtratoService(
    private val transacaoRepository: TransacaoRepository
) {
    fun getExtrato(numeroConta: String): List<ExtratoDTO> {
        val listaDeEntidades = transacaoRepository.findAllByContaNumeroConta(numeroConta)

        val listaDeExtratos = listaDeEntidades.map { entidade ->
            ExtratoDTO(
                valor = entidade.valor,
                tipo = entidade.tipo.toString(),
                dataHora = entidade.dataHora
            )
        }

        return listaDeExtratos
    }
}