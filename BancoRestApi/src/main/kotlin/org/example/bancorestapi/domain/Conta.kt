package org.example.bancorestapi.domain

import jakarta.persistence.*
import java.math.BigDecimal

@Entity
@Table(name = "contas")
class Conta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    @Column(unique = true)
    lateinit var numeroConta: String

    lateinit var saldo: BigDecimal

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    var cliente: Cliente? = null

    @OneToMany(mappedBy = "conta", cascade = [CascadeType.ALL])
    var transacoes: List<Transacao> = mutableListOf()
}