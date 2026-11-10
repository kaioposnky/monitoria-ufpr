package com.sistema.controller;

import com.sistema.dto.request.*;
import com.sistema.dto.response.MonitorResponseDTO;
import com.sistema.service.MonitorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/monitores")
@Tag(name = "Monitores", description = "Gerenciamento de monitores vinculados às vagas de monitoria")
public class MonitorController {
    private final MonitorService service;
    public MonitorController(MonitorService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Listar monitores", description = "Retorna todos os monitores cadastrados.")
    public List<MonitorResponseDTO> listar() { return service.listar(); }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar monitor por ID", description = "Retorna os detalhes de um monitor específico.")
    public MonitorResponseDTO buscar(@PathVariable Long id) { return service.buscar(id); }

    @GetMapping("/vaga/{vagaId}")
    @Operation(summary = "Listar monitores por vaga", description = "Retorna os monitores vinculados a uma vaga de monitoria.")
    public List<MonitorResponseDTO> porVaga(@PathVariable Long vagaId) { return service.porVaga(vagaId); }

    @GetMapping("/aluno/{alunoId}")
    @Operation(summary = "Listar monitorias por aluno", description = "Retorna os vínculos de monitoria de um aluno.")
    public List<MonitorResponseDTO> porAluno(@PathVariable Long alunoId) { return service.porAluno(alunoId); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@accessGuard.canManageMonitorForVacancy(#dto.vagaId(), authentication)")
    @Operation(summary = "Cadastrar monitor", description = "Vincula um aluno aprovado como monitor de uma vaga.")
    public MonitorResponseDTO criar(@Valid @RequestBody CadastroMonitorDTO dto) { return service.criar(dto); }

    @PutMapping("/{id}")
    @PreAuthorize("@accessGuard.canManageMonitorById(#id, authentication)")
    @Operation(summary = "Atualizar monitor", description = "Atualiza os dados de um monitor existente.")
    public MonitorResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody AtualizacaoMonitorDTO dto) { return service.atualizar(id, dto); }

    @PatchMapping("/{id}")
    @PreAuthorize("@accessGuard.canManageMonitorById(#id, authentication)")
    @Operation(summary = "Atualizar monitor parcialmente", description = "Atualiza parcialmente os dados de um monitor existente.")
    public MonitorResponseDTO atualizarParcial(@PathVariable Long id, @Valid @RequestBody AtualizacaoMonitorDTO dto) { return service.atualizar(id, dto); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@accessGuard.canManageMonitorById(#id, authentication)")
    @Operation(summary = "Excluir monitor", description = "Remove um vínculo de monitor pelo identificador.")
    public void excluir(@PathVariable Long id) { service.excluir(id); }
}
