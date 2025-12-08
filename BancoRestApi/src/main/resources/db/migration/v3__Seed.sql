-- V3__Popular_Banco.sql

-- 1. Inserir Clientes
INSERT INTO public.clientes (nome, cpf) VALUES
    ('Daniel Braga', '10050657488'),
    ('Josephy Cruz', '12345678901'),
    ('gracon lima', '10987654321'),
    ('manu', '13243567890'),
    ('DSD', '00000000000');

-- 2. Inserir Usuários
INSERT INTO public.usuario (cliente_id, role, username, password_hash) VALUES
    (1, 'USER', '10050657488', '123456'),
    (2, 'USER', '12345678901', '123456'),
    (3, 'USER', '10987654321', '123456'),
    (4, 'USER', '13243567890', '123456'),
    (5, 'USER', '00000000000', '123456');

-- 3. Inserir Contas (Usando a tabela 'contas' no plural que configuramos)
INSERT INTO public.contas (numero_conta, saldo, cliente_id) VALUES
    ('190612', 2880.00,  1),
    ('123456', 2160.00,  2),
    ('654321', 10000.00, 3),
    ('987654', 19000.00, 4),
    ('789456', 60.00,    5);