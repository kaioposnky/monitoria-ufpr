package com.sistema.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public class CursoMateriaId implements Serializable {
    @Column(name = "curso_id")
    private Long cursoId;
    @Column(name = "materia_id")
    private Long materiaId;

    protected CursoMateriaId() {}
    public CursoMateriaId(Long cursoId, Long materiaId) {
        this.cursoId = cursoId; this.materiaId = materiaId;
    }
    public Long getCursoId() { return cursoId; }
    public Long getMateriaId() { return materiaId; }
    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CursoMateriaId other)) return false;
        return cursoId.equals(other.cursoId) && materiaId.equals(other.materiaId);
    }
    @Override public int hashCode() { return java.util.Objects.hash(cursoId, materiaId); }
}
