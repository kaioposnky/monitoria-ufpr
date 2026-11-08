package com.sistema.dto.request;

import com.sistema.entity.VagaMonitoria;

public record AtualizacaoParcialVagaMonitoriaDTO(String semestre, Integer quantidadeVagas,
        VagaMonitoria.TipoVaga tipoVaga, String requisitos, String descricao, VagaMonitoria.StatusVaga status) {}
