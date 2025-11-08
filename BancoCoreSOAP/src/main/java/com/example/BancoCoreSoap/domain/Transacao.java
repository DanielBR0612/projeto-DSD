package com.example.BancoCoreSoap.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transacao")
public class Transacao {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private BigDecimal valor;
	
	private LocalDateTime dataHora;
	
	private TipoTransacao tipo;
	
	@Enumerated(EnumType.STRING)
	
	@ManyToOne
	@JoinColumn(name = "conta_id")
	private Conta conta;
	
	public Transacao() {
		
	}
	
	public Transacao(BigDecimal valor, LocalDateTime dataHora, TipoTransacao tipo, Conta conta) {
		this.valor = valor;
		this.dataHora = dataHora;
		this.tipo = tipo;
		this.conta = conta;
	}
	
	public Long getId() {
		return this.id;
	}
	
	public BigDecimal getValor() {
		return this.valor;
	}
	
	public LocalDateTime getDataHora() {
		return this.dataHora;
	}
	
	public TipoTransacao getTipo() {
		return this.tipo;
	}
	
	public Conta getConta() {
		return this.conta;
	}
	
	public void setValor(BigDecimal valor) {
		this.valor = valor;
	}
	
	public void setDataHora(LocalDateTime dataHora) {
		this.dataHora = dataHora;
	}
	
	public void setTipo(TipoTransacao tipo) {
		this.tipo = tipo;
	}
	
	public void setConta(Conta conta) {
		this.conta = conta;
	}
}
