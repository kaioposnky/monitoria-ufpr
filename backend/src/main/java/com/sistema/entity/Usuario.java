package com.sistema.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {

    public enum TipoUsuario {
        ALUNO, PROFESSOR, ADMIN
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_usuario", nullable = false, length = 30)
    private TipoUsuario tipoUsuario;

    @Column(unique = true, length = 50)
    private String matricula;

    @Column(name = "curso_id")
    private Long cursoId;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(name = "senha_hash", nullable = false, length = 255)
    private String senhaHash;

    @Column(name = "criado_em", insertable = false, updatable = false)
    private OffsetDateTime criadoEm;

    protected Usuario() {
    }

    public Usuario(String nome, String email, TipoUsuario tipoUsuario, String matricula, Long cursoId, String senhaHash) {
        this.nome = nome;
        this.email = email;
        this.tipoUsuario = tipoUsuario;
        this.matricula = matricula;
        this.cursoId = cursoId;
        this.senhaHash = senhaHash;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public TipoUsuario getTipoUsuario() { return tipoUsuario; }
    public String getMatricula() { return matricula; }
    public Long getCursoId() { return cursoId; }
    public boolean isAtivo() { return ativo; }
    public String getSenhaHash() { return senhaHash; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }

    public void atualizar(String nome, String email, TipoUsuario tipoUsuario, String matricula, Long cursoId, Boolean ativo, String novaSenhaHash) {
        this.nome = nome;
        this.email = email;
        if (tipoUsuario != null) {
            this.tipoUsuario = tipoUsuario;
        }
        this.matricula = matricula;
        this.cursoId = cursoId;
        if (ativo != null) {
            this.ativo = ativo;
        }
        if (novaSenhaHash != null && !novaSenhaHash.isBlank()) {
            this.senhaHash = novaSenhaHash;
        }
    }
}
