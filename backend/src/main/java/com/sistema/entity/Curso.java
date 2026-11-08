package com.sistema.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "cursos")
public class Curso {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 20)
    private String codigo;
    @Column(nullable = false, length = 150)
    private String nome;
    @Column(length = 100)
    private String setor;

    protected Curso() {}
    public Curso(String codigo, String nome, String setor) {
        this.codigo = codigo; this.nome = nome; this.setor = setor;
    }
    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public String getNome() { return nome; }
    public String getSetor() { return setor; }
    public void atualizar(String codigo, String nome, String setor) {
        this.codigo = codigo; this.nome = nome; this.setor = setor;
    }
}
