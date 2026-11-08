package com.sistema.entity;

import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "horarios_atendimento")
public class HorarioAtendimento {
    public enum DiaSemana { SEGUNDA, TERCA, QUARTA, QUINTA, SEXTA, SABADO }
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "monitor_id", nullable = false) private Long monitorId;
    @Enumerated(EnumType.STRING) @Column(name = "dia_semana", nullable = false, length = 20) private DiaSemana diaSemana;
    @Column(name = "hora_inicio", nullable = false) private LocalTime horaInicio;
    @Column(name = "hora_fim", nullable = false) private LocalTime horaFim;
    @Column(name = "local_atendimento", nullable = false, length = 150) private String localAtendimento;
    @Column(name = "link_reuniao", length = 255) private String linkReuniao;
    protected HorarioAtendimento() {}
    public HorarioAtendimento(Long monitorId, DiaSemana dia, LocalTime inicio, LocalTime fim, String local, String link) {
        this.monitorId = monitorId; this.diaSemana = dia; this.horaInicio = inicio; this.horaFim = fim;
        this.localAtendimento = local; this.linkReuniao = link;
    }
    public Long getId() { return id; } public Long getMonitorId() { return monitorId; }
    public DiaSemana getDiaSemana() { return diaSemana; } public LocalTime getHoraInicio() { return horaInicio; }
    public LocalTime getHoraFim() { return horaFim; } public String getLocalAtendimento() { return localAtendimento; }
    public String getLinkReuniao() { return linkReuniao; }
    public void atualizar(DiaSemana dia, LocalTime inicio, LocalTime fim, String local, String link) {
        this.diaSemana = dia; this.horaInicio = inicio; this.horaFim = fim; this.localAtendimento = local; this.linkReuniao = link;
    }
}
