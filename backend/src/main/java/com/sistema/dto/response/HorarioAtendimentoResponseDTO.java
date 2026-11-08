package com.sistema.dto.response;

import com.sistema.entity.HorarioAtendimento;
import java.time.LocalTime;

public record HorarioAtendimentoResponseDTO(Long id, Long monitorId, HorarioAtendimento.DiaSemana diaSemana,
        LocalTime horaInicio, LocalTime horaFim, String localAtendimento, String linkReuniao) {
    public static HorarioAtendimentoResponseDTO from(HorarioAtendimento e) { return new HorarioAtendimentoResponseDTO(e.getId(), e.getMonitorId(), e.getDiaSemana(), e.getHoraInicio(), e.getHoraFim(), e.getLocalAtendimento(), e.getLinkReuniao()); }
}
