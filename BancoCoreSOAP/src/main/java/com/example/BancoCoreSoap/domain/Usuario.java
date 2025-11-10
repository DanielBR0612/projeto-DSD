package com.example.BancoCoreSoap.domain;

import jakarta.persistence.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Entity
public class Usuario {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(unique = true, nullable = false)
	private String username;
	
	@Column(nullable = false)
	private String passwordHash;
	
	@Enumerated(EnumType.STRING)
	private Role role;
	
	@OneToOne
	@JoinColumn(name = "cliente_id")
	private Cliente cliente;
	
	public Usuario() {
	}
	
	public Usuario(String username, String passwordHash, Role role, Cliente cliente) {
		this.username = username;
		setPasswordHash(passwordHash);
		this.role = role;
		this.cliente = cliente;
	}
	
	public Long getId() {
		return this.id;
	}
	
	public String getUsername() {
		return this.username;
	}
	
	public String getPasswordHash() {
		return this.passwordHash;
	}
	
	public Role getRole() {
		return this.role;
	}
	
	public Cliente getCliente() {
		return this.cliente;
	}
	
	public void setUsername(String username) {
		this.username = username;
	}
	
	public void setPasswordHash(String password) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        this.passwordHash = encoder.encode(password);
	}
	
	public void setRole(Role role) {
		this.role = role;
	}
	
	public void setCliente(Cliente cliente) {
		this.cliente = cliente;
	}
	
	

}
