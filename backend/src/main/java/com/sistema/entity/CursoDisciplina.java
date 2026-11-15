package com.sistema.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "cursos_disciplinas")
public class CursoDisciplina {
    @EmbeddedId
    private CursoDisciplinaId id;
    protected CursoDisciplina() {}
    public CursoDisciplina(Long cursoId, Long disciplinaId) {
        this.id = new CursoDisciplinaId(cursoId, disciplinaId);
    }
    public CursoDisciplinaId getId() { return id; }
    public Long getCursoId() { return id.getCursoId(); }
    public Long getDisciplinaId() { return id.getDisciplinaId(); }
}
