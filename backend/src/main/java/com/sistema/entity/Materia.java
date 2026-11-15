package com.sistema.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "materias")
public class Materia {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "disciplina_id", nullable = false)
    private Long disciplinaId;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    protected Materia() {}

    public Materia(Long disciplinaId, String nome, String descricao) {
        this.disciplinaId = disciplinaId;
        this.nome = nome;
        this.descricao = descricao;
    }

    public Long getId() { return id; }
    public Long getDisciplinaId() { return disciplinaId; }
    public String getNome() { return nome; }
    public String getDescricao() { return descricao; }

    public void atualizar(Long disciplinaId, String nome, String descricao) {
        this.disciplinaId = disciplinaId;
        this.nome = nome;
        this.descricao = descricao;
    }
}
