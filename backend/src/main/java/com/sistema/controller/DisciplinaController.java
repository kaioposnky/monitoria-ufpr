package com.sistema.controller;

import com.sistema.dto.request.AtualizacaoDisciplinaDTO;
import com.sistema.dto.request.CadastroDisciplinaDTO;
import com.sistema.dto.response.DisciplinaResponseDTO;
import com.sistema.service.DisciplinaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/disciplinas")
@Tag(name = "Disciplinas", description = "Cadastro e consulta de disciplinas acadêmicas")
public class DisciplinaController {
    private final DisciplinaService service;

    public DisciplinaController(DisciplinaService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar disciplinas", description = "Retorna todas as disciplinas cadastradas.")
    public List<DisciplinaResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar disciplina por ID", description = "Retorna os detalhes de uma disciplina específica.")
    public DisciplinaResponseDTO buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cadastrar disciplina", description = "Cria uma nova disciplina.")
    public DisciplinaResponseDTO criar(@Valid @RequestBody CadastroDisciplinaDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar disciplina", description = "Atualiza os dados de uma disciplina existente.")
    public DisciplinaResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody AtualizacaoDisciplinaDTO dto) {
        return service.atualizar(id, dto);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar disciplina parcialmente", description = "Atualiza parcialmente os dados de uma disciplina existente.")
    public DisciplinaResponseDTO atualizarParcial(@PathVariable Long id, @Valid @RequestBody AtualizacaoDisciplinaDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Excluir disciplina", description = "Remove uma disciplina pelo identificador.")
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}
