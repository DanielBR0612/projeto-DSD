package com.example.BancoCoreSoap;

import com.example.demo.banco.gen.ConsultarSaldoRequest;
import com.example.demo.banco.gen.ConsultarSaldoResponse;
import com.example.BancoCoreSoap.domain.Conta; 
import com.example.BancoCoreSoap.repository.ContaRepository; 
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
    
    private final ClienteRepository clienteRepository;

    @Autowired
    public BancoEndpoint(ContaRepository contaRepository) {
        this.contaRepository = contaRepository;
    }
    
    @Autowired
    public BancoEndpoint(ClienteRepository clienteRepository) {
    	this.clienteRepository = clienteRepository;
    }

    @PayloadRoot(namespace = NAMESPACE_URI, localPart = "consultarSaldoRequest")
    @ResponsePayload
    public ConsultarSaldoResponse consultarSaldo(@RequestPayload ConsultarSaldoRequest request) {

        System.out.println("Recebida requisição para conta: " + request.getNumeroConta());

        Optional<Conta> contaOptional = contaRepository.findById(request.getNumeroConta());

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
            response.setSaldo(BigDecimal.ZERO); // Saldo zero
            response.setNomeCliente("CONTA NÃO ENCONTRADA");
            response.setNumeroConta(request.getNumeroConta());
        }

        return response; 
    }
    
    @PayloadRoot(namespace = NAMESIApACE_URI, localPart = "criarClienteRequest")
    @ResponsePayload
    public CriarClienteResponse criarCliente(@RequestPayload CriarClienteRequest request) {
    }
  
}