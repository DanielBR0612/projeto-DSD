package org.example.bancorestapi.repository

import org.example.bancorestapi.domain.Conta
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ContaRepository : JpaRepository<Conta, String> {

    fun findByNumeroConta(numeroConta: String): Conta?
}