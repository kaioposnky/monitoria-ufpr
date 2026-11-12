package com.sistema.dto.request;

import com.sistema.entity.VagaMonitoria;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AtualizacaoVagaMonitoriaDTO(
        @NotBlank String semestre,
        @NotNull @Min(1) Integer quantidadeVagas,
        @NotNull VagaMonitoria.TipoVaga tipoVaga,
        String requisitos,
        String descricao,
        @NotNull VagaMonitoria.StatusVaga status,
        LocalDate dataAbertura,
        LocalDate dataEncerramento
) {
    public AtualizacaoVagaMonitoriaDTO(String semestre, Integer quantidadeVagas,
                                       VagaMonitoria.TipoVaga tipoVaga, String requisitos,
                                       String descricao, VagaMonitoria.StatusVaga status) {
        this(semestre, quantidadeVagas, tipoVaga, requisitos, descricao, status, null, null);
    }
}
