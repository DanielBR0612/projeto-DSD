package org.example.bancorestapi.domain

import jakarta.persistence.*

@Entity
@Table(name = "clientes")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null

    @Column(unique = true)
    var cpf: String? = null

    var nome: String? = null

    @OneToMany(mappedBy = "cliente", cascade = [CascadeType.ALL])
    var contas: List<Conta> = mutableListOf()
}