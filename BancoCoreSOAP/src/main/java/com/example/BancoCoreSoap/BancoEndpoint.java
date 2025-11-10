package com.example.BancoCoreSoap;

import com.example.demo.banco.gen.AlterarSenhaAcessoRequest;
import com.example.demo.banco.gen.AlterarSenhaAcessoResponse;
import com.example.demo.banco.gen.ConsultarSaldoRequest;
import com.example.demo.banco.gen.ConsultarSaldoResponse;
import com.example.demo.banco.gen.CriarClienteRequest;
import com.example.demo.banco.gen.CriarClienteResponse;
import com.example.demo.banco.gen.CriarContaRequest;
import com.example.demo.banco.gen.CriarContaResponse;
import com.example.demo.banco.gen.RealizarTransferenciaTEDRequest;
import com.example.demo.banco.gen.RealizarTransferenciaTEDResponse;
import com.example.BancoCoreSoap.domain.Conta; 
import com.example.BancoCoreSoap.repository.ContaRepository;
import com.example.BancoCoreSoap.service.ClienteService;
import com.example.BancoCoreSoap.service.ContaService;
import com.example.BancoCoreSoap.service.UsuarioService;
import com.example.BancoCoreSoap.repository.ClienteRepository; 

import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;

import java.math.BigDecimal;
import java.util.Optional; 

@Endpoint
public class BancoEndpoint {

    private static final String NAMESPACE_URI = "http://www.example.com/demo/banco";

    private final ContaRepository contaRepository;
    
    
    @Autowired
    private ClienteService clienteService;
    
    @Autowired
    private ContaService contaService;
    
    @Autowired
    private UsuarioService usuarioService;
    

    @Autowired
    public BancoEndpoint(ContaRepository contaRepository, ClienteRepository clienteRepository) {
        this.contaRepository = contaRepository;
    }
    

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "consultarSaldoRequest")
    @ResponsePayload
    public ConsultarSaldoResponse consultarSaldo(@RequestPayload ConsultarSaldoRequest request) {

        Optional<Conta> contaOptional = contaRepository.findByNumeroConta(request.getNumeroConta());

        ConsultarSaldoResponse response = new ConsultarSaldoResponse();

        if (contaOptional.isPresent()) {
            Conta conta = contaOptional.get(); 
            
            response.setSaldo(conta.getSaldo());
            response.setNumeroConta(conta.getNumeroConta());
            
            if (conta.getCliente() != null) {
                response.setNomeCliente(conta.getCliente().getNome());
            } else {
                response.setNomeCliente("Cliente não associado");
            }
            
        } else {
            response.setSaldo(BigDecimal.ZERO);
            response.setNomeCliente("CONTA NÃO ENCONTRADA");
            response.setNumeroConta(request.getNumeroConta());
        }

        return response; 
    }
    
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "criarClienteRequest")
    @ResponsePayload
    public CriarClienteResponse criarCliente(@RequestPayload CriarClienteRequest request) {
    	CriarClienteResponse createdCliente = clienteService.create(request);
    	
    	return createdCliente;
    }
    
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "criarContaRequest")
    @ResponsePayload
    public CriarContaResponse criarConta(@RequestPayload CriarContaRequest request) {
    	CriarContaResponse createdConta = contaService.create(request);
    	
    	return createdConta;
    }
    
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "realizarTransferenciaTEDRequest")
    @ResponsePayload
    public RealizarTransferenciaTEDResponse realizerTransferenciaTED(@RequestPayload RealizarTransferenciaTEDRequest request) {
    	RealizarTransferenciaTEDResponse transferenciaTED = contaService.realizarTransferencia(request);
    	
    	return transferenciaTED;
    }
    
    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "alterarSenhaAcessoRequest")
    @ResponsePayload
    public AlterarSenhaAcessoResponse alterarSenha(@RequestPayload AlterarSenhaAcessoRequest request) {
    	AlterarSenhaAcessoResponse senha = usuarioService.alterarSenha(request);
    	
    	return senha;
    }
  
}