CREATE TABLE IF NOT EXISTS contas (
    id BIGSERIAL PRIMARY KEY
);

CREATE TABLE transacao (
    id BIGSERIAL PRIMARY KEY,
    data_hora TIMESTAMP(6),
    tipo VARCHAR(255),
    valor NUMERIC(38, 2),
    conta_id BIGINT,
    
    CONSTRAINT fk_transacao_conta FOREIGN KEY (conta_id) REFERENCES contas(id)
);
