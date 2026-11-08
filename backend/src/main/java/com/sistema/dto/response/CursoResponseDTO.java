package com.sistema.dto.response;

import com.sistema.entity.Curso;

public record CursoResponseDTO(Long id, String codigo, String nome, String setor) {
    public static CursoResponseDTO from(Curso e) { return new CursoResponseDTO(e.getId(), e.getCodigo(), e.getNome(), e.getSetor()); }
}
