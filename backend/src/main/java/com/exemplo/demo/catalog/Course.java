package com.exemplo.demo.catalog;

import jakarta.persistence.*;

@Entity
@Table(name = "cursos")
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 20) private String codigo;
    @Column(nullable = false, length = 150) private String nome;
    @Column(length = 100) private String setor;
    protected Course() {}
    public Course(String codigo, String nome, String setor) { this.codigo = codigo; this.nome = nome; this.setor = setor; }
    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public String getNome() { return nome; }
    public String getSetor() { return setor; }
}
