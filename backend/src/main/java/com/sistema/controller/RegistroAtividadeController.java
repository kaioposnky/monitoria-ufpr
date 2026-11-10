package com.sistema.controller;

import com.sistema.dto.request.*;
import com.sistema.dto.response.RegistroAtividadeResponseDTO;
import com.sistema.service.RegistroAtividadeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/registros-atividades")
@Tag(name = "Registros de atividades", description = "Registro de horas/atividades dos monitores e aprovação pelo responsável")
public class RegistroAtividadeController {
    private final RegistroAtividadeService service;
    public RegistroAtividadeController(RegistroAtividadeService service) { this.service = service; }

    @GetMapping
    @PreAuthorize("@accessGuard.isProfessorOrAdmin(authentication)")
    @Operation(summary = "Listar registros de atividades", description = "Retorna todos os registros de atividades dos monitores.")
    public List<RegistroAtividadeResponseDTO> listar() { return service.listar(); }

    @GetMapping("/{id}")
    @PreAuthorize("@accessGuard.canManageActivityLog(#id, authentication)")
    @Operation(summary = "Buscar registro por ID", description = "Retorna os detalhes de um registro de atividade específico.")
    public RegistroAtividadeResponseDTO buscar(@PathVariable Long id) { return service.buscar(id); }

    @GetMapping("/monitor/{monitorId}")
    @PreAuthorize("@accessGuard.canManageMonitorOwnedResource(#monitorId, authentication)")
    @Operation(summary = "Listar registros por monitor", description = "Retorna os registros de atividades de um monitor específico.")
    public List<RegistroAtividadeResponseDTO> porMonitor(@PathVariable Long monitorId) { return service.porMonitor(monitorId); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@accessGuard.canManageMonitorOwnedResource(#dto.monitorId(), authentication)")
    @Operation(summary = "Criar registro de atividade", description = "Registra uma nova atividade e carga horária realizada por um monitor.")
    public RegistroAtividadeResponseDTO criar(@Valid @RequestBody CadastroRegistroAtividadeDTO dto) { return service.criar(dto); }

    @PutMapping("/{id}")
    @PreAuthorize("@accessGuard.canManageActivityLog(#id, authentication)")
    @Operation(summary = "Atualizar registro de atividade", description = "Atualiza os dados de um registro de atividade existente.")
    public RegistroAtividadeResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody AtualizacaoRegistroAtividadeDTO dto) { return service.atualizar(id, dto); }

    @PatchMapping("/{id}")
    @PreAuthorize("@accessGuard.canManageActivityLog(#id, authentication)")
    @Operation(summary = "Atualizar registro parcialmente", description = "Atualiza parcialmente os dados de um registro de atividade.")
    public RegistroAtividadeResponseDTO atualizarParcial(@PathVariable Long id, @Valid @RequestBody AtualizacaoRegistroAtividadeDTO dto) { return service.atualizar(id, dto); }

    @PatchMapping("/{id}/aprovacao")
    @PreAuthorize("@accessGuard.canApproveActivityLog(#id, authentication)")
    @Operation(summary = "Aprovar ou reprovar registro", description = "Registra a aprovação ou reprovação de uma atividade pelo professor/responsável.")
    public RegistroAtividadeResponseDTO aprovacao(@PathVariable Long id, @Valid @RequestBody AprovacaoRegistroAtividadeDTO dto) { return service.aprovacao(id, dto); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@accessGuard.canManageActivityLog(#id, authentication)")
    @Operation(summary = "Excluir registro de atividade", description = "Remove um registro de atividade pelo identificador.")
    public void excluir(@PathVariable Long id) { service.excluir(id); }
}
