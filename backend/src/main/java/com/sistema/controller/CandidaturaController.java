package com.sistema.controller;

import com.sistema.dto.request.*;
import com.sistema.dto.response.CandidaturaResponseDTO;
import com.sistema.service.CandidaturaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/candidaturas")
@Tag(name = "Candidaturas", description = "Inscrição de alunos em vagas de monitoria e avaliação de status")
public class CandidaturaController {
    private final CandidaturaService service;
    public CandidaturaController(CandidaturaService service) { this.service = service; }

    @GetMapping
    @PreAuthorize("@accessGuard.isProfessorOrAdmin(authentication)")
    @Operation(summary = "Listar candidaturas", description = "Retorna todas as candidaturas registradas.")
    public List<CandidaturaResponseDTO> listar() { return service.listar(); }

    @GetMapping("/{id}")
    @PreAuthorize("@accessGuard.canReadApplication(#id, authentication)")
    @Operation(summary = "Buscar candidatura por ID", description = "Retorna os detalhes de uma candidatura específica.")
    public CandidaturaResponseDTO buscar(@PathVariable Long id) { return service.buscar(id); }

    @GetMapping("/vaga/{vagaId}")
    @PreAuthorize("@accessGuard.isProfessorOrAdmin(authentication)")
    @Operation(summary = "Listar candidaturas por vaga", description = "Retorna todas as candidaturas associadas a uma vaga de monitoria.")
    public List<CandidaturaResponseDTO> porVaga(@PathVariable Long vagaId) { return service.porVaga(vagaId); }

    @GetMapping("/aluno/{alunoId}")
    @PreAuthorize("@accessGuard.canReadStudentApplications(#alunoId, authentication)")
    @Operation(summary = "Listar candidaturas por aluno", description = "Retorna todas as candidaturas realizadas por um aluno.")
    public List<CandidaturaResponseDTO> porAluno(@PathVariable Long alunoId) { return service.porAluno(alunoId); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@accessGuard.canCreateApplication(#dto.alunoId(), authentication)")
    @Operation(summary = "Criar candidatura", description = "Registra a candidatura de um aluno em uma vaga de monitoria.")
    public CandidaturaResponseDTO criar(@Valid @RequestBody CadastroCandidaturaDTO dto) { return service.criar(dto); }

    @PutMapping("/{id}")
    @PreAuthorize("@accessGuard.canManageApplication(#id, authentication)")
    @Operation(summary = "Atualizar candidatura", description = "Atualiza os dados de uma candidatura existente.")
    public CandidaturaResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody AtualizacaoCandidaturaDTO dto) { return service.atualizar(id, dto); }

    @PatchMapping("/{id}")
    @PreAuthorize("@accessGuard.canManageApplication(#id, authentication)")
    @Operation(summary = "Atualizar candidatura parcialmente", description = "Atualiza parcialmente os dados de uma candidatura existente.")
    public CandidaturaResponseDTO atualizarParcial(@PathVariable Long id, @RequestBody AtualizacaoCandidaturaDTO dto) { return service.atualizar(id, dto); }

    @PatchMapping("/{id}/status")
    @PreAuthorize("@accessGuard.canReviewApplication(#id, authentication)")
    @Operation(summary = "Atualizar status da candidatura", description = "Altera o status da candidatura (ex.: APROVADO ou REPROVADO).")
    public CandidaturaResponseDTO status(@PathVariable Long id, @Valid @RequestBody AtualizacaoStatusCandidaturaDTO dto) { return service.status(id, dto); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@accessGuard.canManageApplication(#id, authentication)")
    @Operation(summary = "Excluir candidatura", description = "Remove uma candidatura pelo identificador.")
    public void excluir(@PathVariable Long id) { service.excluir(id); }
}
