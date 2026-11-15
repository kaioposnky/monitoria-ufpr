package com.sistema.dto.request;

import com.sistema.entity.VagaMonitoria;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CadastroVagaMonitoriaDTO(
        @NotNull Long disciplinaId,
        @NotNull Long professorId,
        @NotBlank String semestre,
        @NotNull @Min(1) Integer quantidadeVagas,
        @NotNull VagaMonitoria.TipoVaga tipoVaga,
        String requisitos,
        String descricao,
        LocalDate dataAbertura,
        LocalDate dataEncerramento
) {
    public CadastroVagaMonitoriaDTO(Long disciplinaId, Long professorId, String semestre,
                                    Integer quantidadeVagas, VagaMonitoria.TipoVaga tipoVaga,
                                    String requisitos, String descricao) {
        this(disciplinaId, professorId, semestre, quantidadeVagas, tipoVaga, requisitos, descricao, null, null);
    }
}
