package com.example.BancoCoreSoap.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.BancoCoreSoap.repository.ContaRepository;
import com.example.BancoCoreSoap.repository.UsuarioRepository;
import com.example.BancoCoreSoap.domain.Conta;
import com.example.BancoCoreSoap.domain.Role;
import com.example.BancoCoreSoap.domain.Usuario;
import com.example.demo.banco.gen.AlterarSenhaAcessoRequest;
import com.example.demo.banco.gen.AlterarSenhaAcessoResponse;
import com.example.demo.banco.gen.CriarUsuarioRequest;
import com.example.demo.banco.gen.CriarUsuarioResponse;

@Service
public class UsuarioService {
	
	@Autowired
	private UsuarioRepository usuarioRepository;
	
	@Autowired
	private ContaRepository contaRepository;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
	
	@Transactional
	public CriarUsuarioResponse create(CriarUsuarioRequest request) {
		Role role = Role.valueOf(request.getRole());
		
		Usuario newUsuario = new Usuario();
		newUsuario.setUsername(request.getUsername());
		newUsuario.setPasswordHash(request.getPassword());
		newUsuario.setRole(role);
		
		Usuario savedUsuario = usuarioRepository.save(newUsuario);
		
		CriarUsuarioResponse response = new CriarUsuarioResponse();
		response.setId(savedUsuario.getId());
		response.setUsername(savedUsuario.getUsername());
		response.setPassword(savedUsuario.getPasswordHash());
		response.setRole(savedUsuario.getRole().name());
		
		return response;
	}
	
	
	@Transactional
	public AlterarSenhaAcessoResponse alterarSenha(AlterarSenhaAcessoRequest request) {
		String numeroConta = request.getNumeroConta();
		
		Conta conta = contaRepository.findByNumeroConta(numeroConta)
				.orElseThrow(() -> new RuntimeException("Não foi possivel encontrar a conta"));
		
		Usuario usuario = conta.getCliente().getUsuario();
	    if (usuario == null) {
	        throw new RuntimeException("Usuário de acesso não associado ao cliente.");
	    }
		
		if (!passwordEncoder.matches(request.getSenhaAntiga(), usuario.getPasswordHash())) {
			throw new RuntimeException("A senha antiga não bate");
		}
		
		usuario.setPasswordHash(request.getSenhaNova());
		
		usuarioRepository.save(usuario);
		
		AlterarSenhaAcessoResponse response = new AlterarSenhaAcessoResponse();
		response.setStatus("SUCESSO");
		response.setMensagem("senha alterada com sucesso");
		response.setNumeroConta(numeroConta);
		
		return response;
		
	}

}
