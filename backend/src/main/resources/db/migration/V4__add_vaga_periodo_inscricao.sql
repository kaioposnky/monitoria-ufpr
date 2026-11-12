-- ==============================================================================
-- V4__add_vaga_periodo_inscricao.sql
-- Datas opcionais de abertura e encerramento de inscrições para integração com agenda
-- ==============================================================================

ALTER TABLE vagas_monitoria ADD COLUMN IF NOT EXISTS data_abertura DATE;
ALTER TABLE vagas_monitoria ADD COLUMN IF NOT EXISTS data_encerramento DATE;

ALTER TABLE vagas_monitoria
    ADD CONSTRAINT chk_vaga_periodo_inscricao
    CHECK (data_encerramento IS NULL OR data_abertura IS NULL OR data_encerramento >= data_abertura);
