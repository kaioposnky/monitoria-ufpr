package com.sistema.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "candidaturas")
public class Candidatura {
    public enum StatusCandidatura { PENDENTE, EM_ANALISE, APROVADO, REPROVADO, DESISTENTE }
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "vaga_id", nullable = false) private Long vagaId;
    @Column(name = "aluno_id", nullable = false) private Long alunoId;
    @Column(name = "nota_disciplina", precision = 4, scale = 2) private BigDecimal notaDisciplina;
    @Column(precision = 4, scale = 2) private BigDecimal cr;
    @Lob private String justificativa;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private StatusCandidatura status = StatusCandidatura.PENDENTE;
    @Column(name = "criado_em", insertable = false, updatable = false) private OffsetDateTime criadoEm;

    protected Candidatura() {}
    public Candidatura(Long vagaId, Long alunoId, BigDecimal notaDisciplina, BigDecimal cr, String justificativa) {
        this.vagaId = vagaId; this.alunoId = alunoId; this.notaDisciplina = notaDisciplina;
        this.cr = cr; this.justificativa = justificativa;
    }
    public Long getId() { return id; }
    public Long getVagaId() { return vagaId; }
    public Long getAlunoId() { return alunoId; }
    public BigDecimal getNotaDisciplina() { return notaDisciplina; }
    public BigDecimal getCr() { return cr; }
    public String getJustificativa() { return justificativa; }
    public StatusCandidatura getStatus() { return status; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public void atualizar(BigDecimal nota, BigDecimal cr, String justificativa, StatusCandidatura status) {
        this.notaDisciplina = nota; this.cr = cr; this.justificativa = justificativa; this.status = status;
    }
}
