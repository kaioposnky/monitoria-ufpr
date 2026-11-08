package com.sistema.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "monitores")
public class Monitor {
    public enum StatusMonitor { ATIVO, INATIVO, DESLIGADO, CONCLUIDO }
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "vaga_id", nullable = false) private Long vagaId;
    @Column(name = "aluno_id", nullable = false) private Long alunoId;
    @Column(name = "candidatura_id") private Long candidaturaId;
    @Column(name = "carga_horaria_semanal", nullable = false) private Integer cargaHorariaSemanal = 12;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private StatusMonitor status = StatusMonitor.ATIVO;
    @Column(name = "data_inicio", nullable = false) private LocalDate dataInicio;
    @Column(name = "data_fim") private LocalDate dataFim;

    protected Monitor() {}
    public Monitor(Long vagaId, Long alunoId, Long candidaturaId, Integer carga, LocalDate inicio, LocalDate fim) {
        this.vagaId = vagaId; this.alunoId = alunoId; this.candidaturaId = candidaturaId;
        this.cargaHorariaSemanal = carga; this.dataInicio = inicio; this.dataFim = fim;
    }
    public Long getId() { return id; } public Long getVagaId() { return vagaId; }
    public Long getAlunoId() { return alunoId; } public Long getCandidaturaId() { return candidaturaId; }
    public Integer getCargaHorariaSemanal() { return cargaHorariaSemanal; } public StatusMonitor getStatus() { return status; }
    public LocalDate getDataInicio() { return dataInicio; } public LocalDate getDataFim() { return dataFim; }
    public void atualizar(Long candidaturaId, Integer carga, StatusMonitor status, LocalDate inicio, LocalDate fim) {
        this.candidaturaId = candidaturaId; this.cargaHorariaSemanal = carga; this.status = status;
        this.dataInicio = inicio; this.dataFim = fim;
    }
}
