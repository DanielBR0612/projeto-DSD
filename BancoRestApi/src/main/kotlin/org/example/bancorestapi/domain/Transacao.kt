package org.example.bancorestapi.domain

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "transacao")
class Transacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    var valor: BigDecimal? = null

    var dataHora: LocalDateTime? = null

    var tipo: TipoTransacao? = null

    @Enumerated(EnumType.STRING)

    @ManyToOne
    @JoinColumn(name = "conta_id")
    var conta: Conta? = null
}

