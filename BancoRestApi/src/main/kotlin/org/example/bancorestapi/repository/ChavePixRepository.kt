package org.example.bancorestapi.repository

import org.example.bancorestapi.domain.ChavePix
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ChavePixRepository : JpaRepository<ChavePix, Long>{

    fun findByChave(chave: String): ChavePix?
}