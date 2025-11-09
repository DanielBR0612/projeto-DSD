package org.example.bancorestapi.repository

import jakarta.persistence.LockModeType
import org.example.bancorestapi.domain.ChavePix
import org.example.bancorestapi.domain.Conta
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.stereotype.Repository

@Repository
interface ContaRepository : JpaRepository<Conta, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    fun findByNumeroConta(numeroConta: String): Conta?

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    fun findById(id: Long): Conta?
}