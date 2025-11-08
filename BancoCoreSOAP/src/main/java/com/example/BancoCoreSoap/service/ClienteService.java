package com.example.BancoCoreSoap.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.transaction.annotation.Transactional;
import com.example.demo.banco.gen.CriarClienteResponse;
import com.example.demo.banco.gen.CriarClienteRequest;
import com.example.BancoCoreSoap.domain.Cliente;
import com.example.BancoCoreSoap.repository.ClienteRepository;

@Service
public class ClienteService {
	
	@Autowired
	private ClienteRepository clienteRepository;
	
	@Transactional
	public CriarClienteResponse create(CriarClienteRequest request) {
		
		Cliente newCliente = new Cliente();
		newCliente.setCpf(request.getCpf());
		newCliente.setNomeCliente(request.getNome());
		
		Cliente savedCliente = clienteRepository.save(newCliente);
		
		CriarClienteResponse response = new CriarClienteResponse();
		response.setId(savedCliente.getId());
		response.setCpf(savedCliente.getCpf());
		response.setNome(savedCliente.getNome());
		
		return response;

	}
	
}

