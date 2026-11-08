package com.sistema.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CadastroMonitorDTO(@NotNull Long vagaId, @NotNull Long alunoId, Long candidaturaId,
        @NotNull @Min(1) Integer cargaHorariaSemanal, @NotNull LocalDate dataInicio, LocalDate dataFim) {}
