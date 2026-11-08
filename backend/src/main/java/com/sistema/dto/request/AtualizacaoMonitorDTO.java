package com.sistema.dto.request;

import com.sistema.entity.Monitor;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record AtualizacaoMonitorDTO(Long candidaturaId, @NotNull @Min(1) Integer cargaHorariaSemanal,
        @NotNull Monitor.StatusMonitor status, @NotNull LocalDate dataInicio, LocalDate dataFim) {}
