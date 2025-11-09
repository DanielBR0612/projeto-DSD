package org.example.bancorestapi.domain

import jakarta.persistence.*

@Entity
@Table(name = "chaves_pix")
class ChavePix {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    @Enumerated(EnumType.STRING)
    lateinit var tipoChave: TipoChave

    @Column(name = "valor_chave")
    lateinit var chave: String

    @ManyToOne
    @JoinColumn(name = "conta_id")
    var conta: Conta? = null
}