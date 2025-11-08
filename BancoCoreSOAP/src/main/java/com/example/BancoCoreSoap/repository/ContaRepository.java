package com.example.BancoCoreSoap.repository;

import com.example.BancoCoreSoap.domain.Conta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContaRepository extends JpaRepository<Conta, String>{
	
}
