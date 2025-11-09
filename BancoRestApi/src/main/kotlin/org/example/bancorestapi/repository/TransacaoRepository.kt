package org.example.bancorestapi.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.example.bancorestapi.domain.Transacao
import org.springframework.stereotype.Repository

@Repository
interface TransacaoRepository : JpaRepository<Transacao, String> {
}