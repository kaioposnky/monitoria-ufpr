package com.sistema.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public class CursoDisciplinaId implements Serializable {
    @Column(name = "curso_id")
    private Long cursoId;
    @Column(name = "disciplina_id")
    private Long disciplinaId;

    protected CursoDisciplinaId() {}
    public CursoDisciplinaId(Long cursoId, Long disciplinaId) {
        this.cursoId = cursoId; this.disciplinaId = disciplinaId;
    }
    public Long getCursoId() { return cursoId; }
    public Long getDisciplinaId() { return disciplinaId; }
    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CursoDisciplinaId other)) return false;
        return cursoId.equals(other.cursoId) && disciplinaId.equals(other.disciplinaId);
    }
    @Override public int hashCode() { return java.util.Objects.hash(cursoId, disciplinaId); }
}
