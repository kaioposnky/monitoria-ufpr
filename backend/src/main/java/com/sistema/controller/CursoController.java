package com.sistema.controller;

import com.sistema.dto.request.*;
import com.sistema.dto.response.CursoResponseDTO;
import com.sistema.service.CursoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/cursos")
@Tag(name = "Cursos", description = "Cadastro e consulta de cursos acadêmicos")
public class CursoController {
    private final CursoService service;
    public CursoController(CursoService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Listar cursos", description = "Retorna todos os cursos cadastrados.")
    public List<CursoResponseDTO> listar() { return service.listar(); }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar curso por ID", description = "Retorna os detalhes de um curso específico.")
    public CursoResponseDTO buscar(@PathVariable Long id) { return service.buscar(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cadastrar curso", description = "Cria um novo curso acadêmico.")
    public CursoResponseDTO criar(@Valid @RequestBody CadastroCursoDTO dto) { return service.criar(dto); }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar curso", description = "Atualiza os dados de um curso existente.")
    public CursoResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody AtualizacaoCursoDTO dto) { return service.atualizar(id, dto); }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar curso parcialmente", description = "Atualiza parcialmente os dados de um curso existente.")
    public CursoResponseDTO atualizarParcial(@PathVariable Long id, @Valid @RequestBody AtualizacaoCursoDTO dto) { return service.atualizar(id, dto); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Excluir curso", description = "Remove um curso pelo identificador.")
    public void excluir(@PathVariable Long id) { service.excluir(id); }
}
