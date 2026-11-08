package com.sistema.dto.request;

import com.sistema.entity.VagaMonitoria;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CadastroVagaMonitoriaDTO(@NotNull Long materiaId, @NotNull Long professorId,
        @NotBlank String semestre, @NotNull @Min(1) Integer quantidadeVagas,
        @NotNull VagaMonitoria.TipoVaga tipoVaga, String requisitos, String descricao) {}
