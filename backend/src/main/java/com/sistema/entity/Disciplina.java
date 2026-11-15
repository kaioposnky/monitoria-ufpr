package com.sistema.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "disciplinas")
public class Disciplina {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 20)
    private String codigo;
    @Column(nullable = false, length = 150)
    private String nome;
    @Column(nullable = false, length = 100)
    private String departamento;

    protected Disciplina() {}
    public Disciplina(String codigo, String nome, String departamento) {
        this.codigo = codigo; this.nome = nome; this.departamento = departamento;
    }
    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public String getNome() { return nome; }
    public String getDepartamento() { return departamento; }
    public void atualizar(String codigo, String nome, String departamento) {
        this.codigo = codigo; this.nome = nome; this.departamento = departamento;
    }
}
