package com.sistema.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "cursos_materias")
public class CursoMateria {
    @EmbeddedId
    private CursoMateriaId id;
    protected CursoMateria() {}
    public CursoMateria(Long cursoId, Long materiaId) {
        this.id = new CursoMateriaId(cursoId, materiaId);
    }
    public CursoMateriaId getId() { return id; }
    public Long getCursoId() { return id.getCursoId(); }
    public Long getMateriaId() { return id.getMateriaId(); }
}
