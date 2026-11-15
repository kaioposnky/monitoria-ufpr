package com.sistema.controller;

import com.sistema.dto.request.AtualizacaoVagaMonitoriaDTO;
import com.sistema.dto.request.AtualizacaoParcialVagaMonitoriaDTO;
import com.sistema.dto.request.CadastroVagaMonitoriaDTO;
import com.sistema.dto.response.VagaMonitoriaResponseDTO;
import com.sistema.service.VagaMonitoriaService;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vagas-monitoria")
@Tag(name = "Vagas de monitoria", description = "Operações de consulta e atualização de vagas")
public class VagaMonitoriaController {

    private final VagaMonitoriaService service;

    public VagaMonitoriaController(VagaMonitoriaService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar vagas de monitoria", description = "Retorna todas as vagas de monitoria cadastradas.")
    public List<VagaMonitoriaResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar vaga de monitoria por ID", description = "Retorna os detalhes de uma vaga de monitoria específica.")
    public VagaMonitoriaResponseDTO buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@accessGuard.canCreateVacancy(#dto.professorId(), authentication)")
    @Operation(summary = "Criar vaga de monitoria", description = "Cadastra uma nova vaga de monitoria vinculada a uma disciplina e a um professor.")
    public VagaMonitoriaResponseDTO criar(@Valid @RequestBody CadastroVagaMonitoriaDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@accessGuard.canManageVacancy(#id, authentication)")
    @Operation(summary = "Atualizar vaga de monitoria", description = "Atualiza todos os dados de uma vaga de monitoria existente.")
    public VagaMonitoriaResponseDTO atualizar(@PathVariable Long id,
                                               @Valid @RequestBody AtualizacaoVagaMonitoriaDTO dto) {
        return service.atualizar(id, dto);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("@accessGuard.canManageVacancy(#id, authentication)")
    @Operation(summary = "Atualizar vaga parcialmente", description = "Atualiza parcialmente os campos informados de uma vaga de monitoria (incluindo status).")
    public VagaMonitoriaResponseDTO atualizarParcial(@PathVariable Long id,
                                                      @RequestBody AtualizacaoParcialVagaMonitoriaDTO dto) {
        return service.atualizarParcial(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@accessGuard.canManageVacancy(#id, authentication)")
    @Operation(summary = "Excluir vaga de monitoria", description = "Remove uma vaga de monitoria pelo identificador.")
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}
