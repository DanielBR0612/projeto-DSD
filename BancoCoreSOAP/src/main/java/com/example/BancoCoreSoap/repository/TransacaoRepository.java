package com.example.BancoCoreSoap.repository;

import com.example.BancoCoreSoap.domain.Transacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransacaoRepository extends JpaRepository<Transacao, String>{

}
