package com.example.BancoCoreSoap.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.List;

@Entity 
@Table(name = "contas") 
public class Conta {

    @Id 
	@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String numeroConta;

    private BigDecimal saldo;
    
    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;
    
    @OneToMany(mappedBy = "conta", cascade = CascadeType.ALL)
    private List<Transacao> transacoes;
    
    public Conta() {
    }

    public Conta(String numeroConta, BigDecimal saldo, Cliente cliente) {
        this.numeroConta = numeroConta;
        this.saldo = saldo;
        this.cliente = cliente;
    }

    public String getNumeroConta() {
        return numeroConta;
    }

    public BigDecimal getSaldo() {
        return saldo;
    }
    
    public Cliente getCliente() {
    	return cliente;
    }

    public void setNumeroConta(String numeroConta) {
        this.numeroConta = numeroConta;
    }

    public void setSaldo(BigDecimal saldo) {
        this.saldo = saldo;
    }
    
    public void setCliente(Cliente cliente) {
    	this.cliente = cliente;
    }
}