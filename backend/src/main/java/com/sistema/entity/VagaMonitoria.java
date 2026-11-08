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
@Table(name = "vagas_monitoria")
public class VagaMonitoria {

    public enum TipoVaga {
        REMUNERADA, VOLUNTARIA
    }

    public enum StatusVaga {
        ABERTA, EM_SELECAO, ENCERRADA, CANCELADA
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "materia_id", nullable = false)
    private Long materiaId;

    @Column(name = "professor_id", nullable = false)
    private Long professorId;

    @Column(nullable = false, length = 10)
    private String semestre;

    @Column(name = "quantidade_vagas", nullable = false)
    private Integer quantidadeVagas = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_vaga", nullable = false, length = 30)
    private TipoVaga tipoVaga;

    @jakarta.persistence.Lob
    private String requisitos;
    @jakarta.persistence.Lob
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusVaga status = StatusVaga.ABERTA;

    @Column(name = "criado_em", insertable = false, updatable = false)
    private OffsetDateTime criadoEm;

    protected VagaMonitoria() {
    }

    public VagaMonitoria(Long materiaId, Long professorId, String semestre, Integer quantidadeVagas,
                         TipoVaga tipoVaga, String requisitos, String descricao) {
        this.materiaId = materiaId;
        this.professorId = professorId;
        this.semestre = semestre;
        this.quantidadeVagas = quantidadeVagas;
        this.tipoVaga = tipoVaga;
        this.requisitos = requisitos;
        this.descricao = descricao;
    }

    public Long getId() { return id; }
    public Long getMateriaId() { return materiaId; }
    public Long getProfessorId() { return professorId; }
    public String getSemestre() { return semestre; }
    public Integer getQuantidadeVagas() { return quantidadeVagas; }
    public TipoVaga getTipoVaga() { return tipoVaga; }
    public String getRequisitos() { return requisitos; }
    public String getDescricao() { return descricao; }
    public StatusVaga getStatus() { return status; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }

    public void atualizar(String semestre, Integer quantidadeVagas, TipoVaga tipoVaga,
                           String requisitos, String descricao, StatusVaga status) {
        this.semestre = semestre;
        this.quantidadeVagas = quantidadeVagas;
        this.tipoVaga = tipoVaga;
        this.requisitos = requisitos;
        this.descricao = descricao;
        this.status = status;
    }
}
