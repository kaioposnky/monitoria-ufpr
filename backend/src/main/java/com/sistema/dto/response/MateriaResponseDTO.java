package com.sistema.dto.response;

import com.sistema.entity.Materia;

public record MateriaResponseDTO(Long id, Long disciplinaId, String nome, String descricao) {
    public static MateriaResponseDTO from(Materia e) {
        return new MateriaResponseDTO(e.getId(), e.getDisciplinaId(), e.getNome(), e.getDescricao());
    }
}
