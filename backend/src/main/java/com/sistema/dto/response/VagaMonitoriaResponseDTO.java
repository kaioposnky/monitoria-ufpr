package com.sistema.dto.response;

import com.sistema.entity.VagaMonitoria;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record VagaMonitoriaResponseDTO(
        Long id,
        Long materiaId,
        Long professorId,
        String semestre,
        Integer quantidadeVagas,
        VagaMonitoria.TipoVaga tipoVaga,
        String requisitos,
        String descricao,
        VagaMonitoria.StatusVaga status,
        LocalDate dataAbertura,
        LocalDate dataEncerramento,
        OffsetDateTime criadoEm
) {
    public static VagaMonitoriaResponseDTO from(VagaMonitoria vaga) {
        return new VagaMonitoriaResponseDTO(
                vaga.getId(),
                vaga.getMateriaId(),
                vaga.getProfessorId(),
                vaga.getSemestre(),
                vaga.getQuantidadeVagas(),
                vaga.getTipoVaga(),
                vaga.getRequisitos(),
                vaga.getDescricao(),
                vaga.getStatus(),
                vaga.getDataAbertura(),
                vaga.getDataEncerramento(),
                vaga.getCriadoEm());
    }
}
