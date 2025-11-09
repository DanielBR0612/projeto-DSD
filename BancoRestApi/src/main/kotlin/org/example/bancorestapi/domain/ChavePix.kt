package org.example.bancorestapi.domain

import jakarta.persistence.*
import org.example.bancorestapi.dto.ChavePixResponseDTO

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
    lateinit var conta: Conta


}

fun ChavePix.toResponseDTO(): ChavePixResponseDTO {
    val numeroContaDaChave = this.conta.numeroConta

    return ChavePixResponseDTO(
        id = this.id!!,
        tipo = this.tipoChave.name,
        valor = this.chave,
        numeroConta = numeroContaDaChave
    )
}