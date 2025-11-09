package org.example.bancorestapi.controller

import org.example.bancorestapi.dto.ExtratoDTO
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController
import org.example.bancorestapi.service.ExtratoService


@RestController
class ExtratoController (
    private val extratoService: ExtratoService
){

    @GetMapping("/extrato/{numeroConta}")
    fun getExtrato(@PathVariable numeroConta: String) : List<ExtratoDTO> {
        return extratoService.getExtrato(numeroConta)
    }
}