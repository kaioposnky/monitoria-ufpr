package com.sistema.dto.response;

import com.sistema.entity.RegistroAtividade;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

public record RegistroAtividadeResponseDTO(Long id, Long monitorId, LocalDate dataAtividade, LocalTime horaInicio,
        LocalTime horaFim, RegistroAtividade.TipoAtividade tipoAtividade, String descricao,
        Integer quantidadeAlunosAtendidos, RegistroAtividade.StatusAprovacao statusAprovacao,
        String feedbackProfessor, OffsetDateTime criadoEm) {
    public static RegistroAtividadeResponseDTO from(RegistroAtividade e) { return new RegistroAtividadeResponseDTO(e.getId(), e.getMonitorId(), e.getDataAtividade(), e.getHoraInicio(), e.getHoraFim(), e.getTipoAtividade(), e.getDescricao(), e.getQuantidadeAlunosAtendidos(), e.getStatusAprovacao(), e.getFeedbackProfessor(), e.getCriadoEm()); }
}
