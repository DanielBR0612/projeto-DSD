package com.example.BancoCoreSoap.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import java.util.List;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;

@Entity 
@Table(name = "clientes") 
public class Cliente {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome; 
    
    @Column(unique = true)
    private String cpf;
    
    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL)
    private List<Conta> contas;
    
    @OneToOne(mappedBy = "cliente", cascade = CascadeType.ALL)
    private Usuario usuario;
    
    public Cliente() {
    }

    public Cliente(Long id, String nome, String cpf, List<Conta> contas, Usuario usuario) {
        this.id = id;
        this.nome = nome;
        this.cpf = cpf;
        this.contas = contas;
        this.usuario = usuario;
    }

    public Long getId() {
        return this.id;
    }

    public String getNome() {
        return this.nome;
    }

    public String getCpf() {
        return this.cpf;
    }
    
    public List<Conta> getContas() {
    	return this.contas;
    }
    
    public Usuario getUsuario() {
    	return this.usuario;
    }

    public void setNumeroConta(Long id) {
        this.id = id;
    }

    public void setNomeCliente(String nome) {
        this.nome = nome;
    }

    public void setCpf(String cpf) {
    	if (cpf.length() != 11) {
    		throw new IllegalArgumentException("Cpf deve ter 11 digitos");
    	}
    	else {
    		this.cpf = cpf;
    	}
    }
    
    public void setUsuario(Usuario usuario) {
    	this.usuario = usuario;
    }

}