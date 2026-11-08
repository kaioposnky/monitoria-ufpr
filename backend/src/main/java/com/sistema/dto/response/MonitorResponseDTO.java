package com.sistema.dto.response;

import com.sistema.entity.Monitor;
import java.time.LocalDate;

public record MonitorResponseDTO(Long id, Long vagaId, Long alunoId, Long candidaturaId, Integer cargaHorariaSemanal,
        Monitor.StatusMonitor status, LocalDate dataInicio, LocalDate dataFim) {
    public static MonitorResponseDTO from(Monitor e) { return new MonitorResponseDTO(e.getId(), e.getVagaId(), e.getAlunoId(), e.getCandidaturaId(), e.getCargaHorariaSemanal(), e.getStatus(), e.getDataInicio(), e.getDataFim()); }
}
