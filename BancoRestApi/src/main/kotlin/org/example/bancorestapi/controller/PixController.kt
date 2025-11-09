package org.example.bancorestapi.controller

import org.example.bancorestapi.dto.PixTransferRequestDTO
import org.example.bancorestapi.dto.PixTransferResponseDTO
import org.example.bancorestapi.service.ContaService
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody

@RestController
class PixController (
    private val contaService: ContaService
) {

    @PostMapping("/pix/transferir")
    fun fazerTransferencia(@RequestBody requestDTO: PixTransferRequestDTO) : PixTransferResponseDTO{
        var transferenciaPix: PixTransferResponseDTO = contaService.realizarTransferenciaPix(requestDTO)

        return transferenciaPix
    }
}