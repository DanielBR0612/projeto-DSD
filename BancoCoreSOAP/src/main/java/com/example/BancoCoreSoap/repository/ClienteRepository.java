package com.example.BancoCoreSoap.repository;

import com.example.BancoCoreSoap.domain.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, String>{
	
}
