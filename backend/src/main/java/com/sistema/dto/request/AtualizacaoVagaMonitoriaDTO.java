package com.sistema.dto.request;

import com.sistema.entity.VagaMonitoria;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AtualizacaoVagaMonitoriaDTO(
        @NotBlank String semestre,
        @NotNull @Min(1) Integer quantidadeVagas,
        @NotNull VagaMonitoria.TipoVaga tipoVaga,
        String requisitos,
        String descricao,
        @NotNull VagaMonitoria.StatusVaga status
) {
}
