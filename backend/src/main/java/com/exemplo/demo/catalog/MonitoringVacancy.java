package com.exemplo.demo.catalog;

import jakarta.persistence.*;

@Entity
@Table(name = "vagas_monitoria")
public class MonitoringVacancy {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "materia_id", nullable = false) private Long subjectId;
    @Column(name = "professor_id", nullable = false) private Long professorId;
    @Column(nullable = false, length = 10) private String semestre;
    @Column(name = "quantidade_vagas", nullable = false) private Integer quantidadeVagas;
    @Column(name = "tipo_vaga", nullable = false, length = 30) private String tipoVaga;
    @Column(columnDefinition = "TEXT") private String requisitos;
    @Column(columnDefinition = "TEXT") private String descricao;
    @Column(nullable = false, length = 20) private String status;
    protected MonitoringVacancy() {}
    public Long getId() { return id; }
    public Long getSubjectId() { return subjectId; }
    public Long getProfessorId() { return professorId; }
    public String getSemestre() { return semestre; }
    public Integer getQuantidadeVagas() { return quantidadeVagas; }
    public String getTipoVaga() { return tipoVaga; }
    public String getRequisitos() { return requisitos; }
    public String getDescricao() { return descricao; }
    public String getStatus() { return status; }
}
