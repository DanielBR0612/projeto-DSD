package org.example.bancorestapi

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class BancoRestApiApplication

fun main(args: Array<String>) {
    runApplication<BancoRestApiApplication>(*args)
}