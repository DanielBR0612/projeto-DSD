package org.example.bancorestapi.controller

import org.example.bancorestapi.domain.ChavePix
import org.example.bancorestapi.dto.ChavePixRequestDTO
import org.example.bancorestapi.dto.ChavePixResponseDTO
import org.example.bancorestapi.dto.PixTransferRequestDTO
import org.example.bancorestapi.dto.PixTransferResponseDTO
import org.example.bancorestapi.service.ChavePixService
import org.example.bancorestapi.service.ContaService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody

@RestController
class PixController (
    private val contaService: ContaService,
    private val chavePixService: ChavePixService
) {

    @PostMapping("/pix/transferir")
    fun fazerTransferencia(@RequestBody requestDTO: PixTransferRequestDTO) : PixTransferResponseDTO {
        return contaService.realizarTransferenciaPix(requestDTO)
    }

    @PostMapping("/clientes/{id}/chaves-pix")
    fun criarChavePix(@PathVariable("id") clienteId: Long, @RequestBody requestDTO: ChavePixRequestDTO) : ChavePixResponseDTO {
        return chavePixService.create(clienteId, requestDTO)
    }

    @GetMapping("/clientes/{numero_conta}/chaves-pix")
    fun getChavePix(@PathVariable("numero_conta") numeroConta: String) : List<ChavePixResponseDTO> {
        return contaService.getChavePix(numeroConta)
    }
}