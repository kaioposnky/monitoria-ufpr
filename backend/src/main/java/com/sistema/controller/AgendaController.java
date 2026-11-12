package com.sistema.controller;

import com.sistema.integration.agenda.EventoAgenda;
import com.sistema.integration.agenda.ServicoAgenda;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/agenda")
@Tag(name = "Agenda", description = "Eventos sincronizados de prazos de vagas e horários de monitoria")
public class AgendaController {

    private final ServicoAgenda servicoAgenda;

    public AgendaController(ServicoAgenda servicoAgenda) {
        this.servicoAgenda = servicoAgenda;
    }

    @GetMapping("/eventos")
    @Operation(summary = "Listar eventos da agenda", description = "Retorna prazos de abertura/encerramento de vagas e horários de atendimento sincronizados.")
    public List<EventoAgenda> listarEventos() {
        return servicoAgenda.listarEventos();
    }

    @GetMapping(value = "/calendario.ics", produces = "text/calendar; charset=UTF-8")
    @Operation(summary = "Exportar calendário iCalendar", description = "Gera arquivo .ics (RFC 5545) com os eventos da monitoria.")
    public ResponseEntity<String> exportarIcs() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"monitoria-ufpr.ics\"")
                .contentType(MediaType.parseMediaType("text/calendar; charset=UTF-8"))
                .body(servicoAgenda.exportarCalendarioIcs());
    }
}
