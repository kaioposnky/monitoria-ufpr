package com.sistema.dto.response;

import com.sistema.entity.Materia;

public record MateriaResponseDTO(Long id, String codigo, String nome, String departamento) {
    public static MateriaResponseDTO from(Materia e) { return new MateriaResponseDTO(e.getId(), e.getCodigo(), e.getNome(), e.getDepartamento()); }
}
