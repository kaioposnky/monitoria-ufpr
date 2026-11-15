package com.sistema.dto.response;

import com.sistema.entity.Disciplina;

public record DisciplinaResponseDTO(Long id, String codigo, String nome, String departamento) {
    public static DisciplinaResponseDTO from(Disciplina e) {
        return new DisciplinaResponseDTO(e.getId(), e.getCodigo(), e.getNome(), e.getDepartamento());
    }
}
