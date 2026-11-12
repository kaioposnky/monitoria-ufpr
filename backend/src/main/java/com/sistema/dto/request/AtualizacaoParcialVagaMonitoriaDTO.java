package com.sistema.dto.request;

import com.sistema.entity.VagaMonitoria;

import java.time.LocalDate;

public record AtualizacaoParcialVagaMonitoriaDTO(
        String semestre,
        Integer quantidadeVagas,
        VagaMonitoria.TipoVaga tipoVaga,
        String requisitos,
        String descricao,
        VagaMonitoria.StatusVaga status,
        LocalDate dataAbertura,
        LocalDate dataEncerramento
) {
    public AtualizacaoParcialVagaMonitoriaDTO(String semestre, Integer quantidadeVagas,
                                              VagaMonitoria.TipoVaga tipoVaga, String requisitos,
                                              String descricao, VagaMonitoria.StatusVaga status) {
        this(semestre, quantidadeVagas, tipoVaga, requisitos, descricao, status, null, null);
    }
}
