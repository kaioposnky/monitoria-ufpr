package com.sistema.controller;

import com.sistema.dto.request.*;
import com.sistema.dto.response.HorarioAtendimentoResponseDTO;
import com.sistema.service.HorarioAtendimentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/horarios-atendimento")
@Tag(name = "Horários de atendimento", description = "Cadastro e consulta de horários de atendimento dos monitores")
public class HorarioAtendimentoController {
    private final HorarioAtendimentoService service;
    public HorarioAtendimentoController(HorarioAtendimentoService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Listar horários de atendimento", description = "Retorna todos os horários de atendimento cadastrados.")
    public List<HorarioAtendimentoResponseDTO> listar() { return service.listar(); }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar horário por ID", description = "Retorna os detalhes de um horário de atendimento específico.")
    public HorarioAtendimentoResponseDTO buscar(@PathVariable Long id) { return service.buscar(id); }

    @GetMapping("/monitor/{monitorId}")
    @Operation(summary = "Listar horários por monitor", description = "Retorna os horários de atendimento de um monitor.")
    public List<HorarioAtendimentoResponseDTO> porMonitor(@PathVariable Long monitorId) { return service.porMonitor(monitorId); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@accessGuard.canManageMonitorOwnedResource(#dto.monitorId(), authentication)")
    @Operation(summary = "Cadastrar horário de atendimento", description = "Registra um novo horário e local/link de atendimento para um monitor.")
    public HorarioAtendimentoResponseDTO criar(@Valid @RequestBody CadastroHorarioAtendimentoDTO dto) { return service.criar(dto); }

    @PutMapping("/{id}")
    @PreAuthorize("@accessGuard.canManageOfficeHour(#id, authentication)")
    @Operation(summary = "Atualizar horário de atendimento", description = "Atualiza os dados de um horário de atendimento existente.")
    public HorarioAtendimentoResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody AtualizacaoHorarioAtendimentoDTO dto) { return service.atualizar(id, dto); }

    @PatchMapping("/{id}")
    @PreAuthorize("@accessGuard.canManageOfficeHour(#id, authentication)")
    @Operation(summary = "Atualizar horário parcialmente", description = "Atualiza parcialmente os dados de um horário de atendimento.")
    public HorarioAtendimentoResponseDTO atualizarParcial(@PathVariable Long id, @Valid @RequestBody AtualizacaoHorarioAtendimentoDTO dto) { return service.atualizar(id, dto); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@accessGuard.canManageOfficeHour(#id, authentication)")
    @Operation(summary = "Excluir horário de atendimento", description = "Remove um horário de atendimento pelo identificador.")
    public void excluir(@PathVariable Long id) { service.excluir(id); }
}
