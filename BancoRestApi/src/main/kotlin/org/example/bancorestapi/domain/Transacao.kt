package org.example.bancorestapi.domain

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime
import org.example.bancorestapi.domain.TipoTransacao

@Entity
@Table(name = "transacao")
class Transacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    lateinit var valor: BigDecimal

    lateinit var dataHora: LocalDateTime

    @Enumerated(EnumType.STRING)
    lateinit var tipo: TipoTransacao

    @ManyToOne
    @JoinColumn(name = "conta_id")
    lateinit var conta: Conta
}

