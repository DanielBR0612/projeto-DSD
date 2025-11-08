package com.example.BancoCoreSoap.repository;

import com.example.BancoCoreSoap.domain.Conta;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

@Repository
public interface ContaRepository extends JpaRepository<Conta, String>{
	
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	Optional<Conta> findByNumeroConta(String numeroConta);
}
