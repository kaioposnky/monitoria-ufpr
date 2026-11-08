package com.sistema.controller;

import com.sistema.dto.request.*;
import com.sistema.dto.response.CandidaturaResponseDTO;
import com.sistema.service.CandidaturaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/v1/candidaturas") @Tag(name = "Candidaturas")
public class CandidaturaController {
    private final CandidaturaService service;
    public CandidaturaController(CandidaturaService service) { this.service = service; }
    @GetMapping public List<CandidaturaResponseDTO> listar() { return service.listar(); }
    @GetMapping("/{id}") public CandidaturaResponseDTO buscar(@PathVariable Long id) { return service.buscar(id); }
    @GetMapping("/vaga/{vagaId}") public List<CandidaturaResponseDTO> porVaga(@PathVariable Long vagaId) { return service.porVaga(vagaId); }
    @GetMapping("/aluno/{alunoId}") public List<CandidaturaResponseDTO> porAluno(@PathVariable Long alunoId) { return service.porAluno(alunoId); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public CandidaturaResponseDTO criar(@Valid @RequestBody CadastroCandidaturaDTO dto) { return service.criar(dto); }
    @PutMapping("/{id}") public CandidaturaResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody AtualizacaoCandidaturaDTO dto) { return service.atualizar(id, dto); }
    @PatchMapping("/{id}") public CandidaturaResponseDTO atualizarParcial(@PathVariable Long id, @RequestBody AtualizacaoCandidaturaDTO dto) { return service.atualizar(id, dto); }
    @PatchMapping("/{id}/status") public CandidaturaResponseDTO status(@PathVariable Long id, @Valid @RequestBody AtualizacaoStatusCandidaturaDTO dto) { return service.status(id, dto); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void excluir(@PathVariable Long id) { service.excluir(id); }
}
