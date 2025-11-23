ALTER TABLE public.transacao DROP CONSTRAINT IF EXISTS transacao_tipo_check;

ALTER TABLE public.transacao ADD CONSTRAINT transacao_tipo_check
    CHECK (tipo IN ('TED', 'SAQUE', 'DEPOSITO', 'PIX'));