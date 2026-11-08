package com.sistema.dto.response;

import com.sistema.entity.Candidatura;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record CandidaturaResponseDTO(Long id, Long vagaId, Long alunoId, BigDecimal notaDisciplina, BigDecimal cr,
        String justificativa, Candidatura.StatusCandidatura status, OffsetDateTime criadoEm) {
    public static CandidaturaResponseDTO from(Candidatura e) { return new CandidaturaResponseDTO(e.getId(), e.getVagaId(), e.getAlunoId(), e.getNotaDisciplina(), e.getCr(), e.getJustificativa(), e.getStatus(), e.getCriadoEm()); }
}
