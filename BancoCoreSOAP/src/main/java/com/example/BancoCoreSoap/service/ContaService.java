package com.example.BancoCoreSoap.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.BancoCoreSoap.repository.ClienteRepository;
import com.example.BancoCoreSoap.repository.ContaRepository;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.banco.gen.CriarContaResponse;
import com.example.demo.banco.gen.CriarContaRequest;
import com.example.BancoCoreSoap.domain.Cliente;
import com.example.BancoCoreSoap.domain.Conta;

@Service
public class ContaService {
	
	@Autowired
	private ClienteRepository clienteRepository;
	
	@Autowired
	private ContaRepository contaRepository;
	
	@Transactional
	public CriarContaResponse create(CriarContaRequest request) {
		 Cliente clienteDono = clienteRepository.findById(request.getClienteId())
				 .orElseThrow(() -> new RuntimeException("Cliente não encontrado!"));
		 
		 Conta newConta = new Conta();
		 newConta.setNumeroConta(request.getNumeroConta());
		 newConta.setSaldo(request.getSaldoInicial()); 
		 newConta.setCliente(clienteDono);
		 
		 Conta savedConta = contaRepository.save(newConta);
		 
		 CriarContaResponse response = new CriarContaResponse();
		 response.setNumeroConta(savedConta.getNumeroConta());
		 response.setSaldo(savedConta.getSaldo());
		 response.setNomeCliente(savedConta.getCliente().getNome());
		 
		 return response;
	}
}
