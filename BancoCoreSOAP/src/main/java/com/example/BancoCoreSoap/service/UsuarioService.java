package com.example.BancoCoreSoap.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.BancoCoreSoap.repository.ContaRepository;
import com.example.BancoCoreSoap.repository.UsuarioRepository;
import com.example.BancoCoreSoap.domain.Conta;
import com.example.BancoCoreSoap.domain.Usuario;
import com.example.demo.banco.gen.AlterarSenhaAcessoRequest;
import com.example.demo.banco.gen.AlterarSenhaAcessoResponse;

@Service
public class UsuarioService {
	
	@Autowired
	private UsuarioRepository usuarioRepository;
	
	@Autowired
	private ContaRepository contaRepository;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
	
	
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
