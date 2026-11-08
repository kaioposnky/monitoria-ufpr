package com.sistema.controller;

import com.sistema.dto.request.*;
import com.sistema.dto.response.MonitorResponseDTO;
import com.sistema.service.MonitorService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/v1/monitores") @Tag(name = "Monitores")
public class MonitorController {
    private final MonitorService service;
    public MonitorController(MonitorService service) { this.service = service; }
    @GetMapping public List<MonitorResponseDTO> listar() { return service.listar(); }
    @GetMapping("/{id}") public MonitorResponseDTO buscar(@PathVariable Long id) { return service.buscar(id); }
    @GetMapping("/vaga/{vagaId}") public List<MonitorResponseDTO> porVaga(@PathVariable Long vagaId) { return service.porVaga(vagaId); }
    @GetMapping("/aluno/{alunoId}") public List<MonitorResponseDTO> porAluno(@PathVariable Long alunoId) { return service.porAluno(alunoId); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public MonitorResponseDTO criar(@Valid @RequestBody CadastroMonitorDTO dto) { return service.criar(dto); }
    @PutMapping("/{id}") public MonitorResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody AtualizacaoMonitorDTO dto) { return service.atualizar(id, dto); }
    @PatchMapping("/{id}") public MonitorResponseDTO atualizarParcial(@PathVariable Long id, @Valid @RequestBody AtualizacaoMonitorDTO dto) { return service.atualizar(id, dto); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void excluir(@PathVariable Long id) { service.excluir(id); }
}
