package com.exemplo.demo.catalog;

import jakarta.persistence.*;

@Entity
@Table(name = "materias")
public class Subject {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 20) private String codigo;
    @Column(nullable = false, length = 150) private String nome;
    @Column(nullable = false, length = 100) private String departamento;
    protected Subject() {}
    public Subject(String codigo, String nome, String departamento) { this.codigo = codigo; this.nome = nome; this.departamento = departamento; }
    public Long getId() { return id; }
    public String getCodigo() { return codigo; }
    public String getNome() { return nome; }
    public String getDepartamento() { return departamento; }
}
