package com.example.BancoCoreSoap.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.transaction.annotation.Transactional;
import com.example.demo.banco.gen.CriarClienteResponse;
import com.example.demo.banco.gen.CriarClienteRequest;
import com.example.BancoCoreSoap.domain.Cliente;
import com.example.BancoCoreSoap.domain.Role;
import com.example.BancoCoreSoap.domain.Usuario;
import com.example.BancoCoreSoap.repository.ClienteRepository;
import com.example.BancoCoreSoap.repository.UsuarioRepository;

@Service
public class ClienteService {
	
	@Autowired
	private ClienteRepository clienteRepository;
	
	@Autowired 
	UsuarioRepository usuarioRepository;
	
	@Transactional
	public CriarClienteResponse create(CriarClienteRequest request) {
	    Cliente newCliente = new Cliente();
	    newCliente.setCpf(request.getCpf());
	    newCliente.setNomeCliente(request.getNome()); 
	    
	    Cliente savedCliente = clienteRepository.save(newCliente);

	    Usuario novoUsuario = new Usuario();
	    novoUsuario.setUsername(request.getCpf()); 
	    novoUsuario.setPasswordHash("123456");    
	    novoUsuario.setRole(Role.USER);        
	    
	    novoUsuario.setCliente(savedCliente); 
	    
	    usuarioRepository.save(novoUsuario);

	    CriarClienteResponse response = new CriarClienteResponse();
	    response.setId(savedCliente.getId());
	    response.setCpf(savedCliente.getCpf());
	    response.setNome(savedCliente.getNome());
	    
	    return response;

	}
	
}

