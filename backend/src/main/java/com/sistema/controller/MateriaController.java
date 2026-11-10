package com.sistema.controller;

import com.sistema.dto.request.*;
import com.sistema.dto.response.MateriaResponseDTO;
import com.sistema.service.MateriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/materias")
@Tag(name = "Matérias", description = "Cadastro e consulta de disciplinas/matérias")
public class MateriaController {
    private final MateriaService service;
    public MateriaController(MateriaService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Listar matérias", description = "Retorna todas as matérias cadastradas.")
    public List<MateriaResponseDTO> listar() { return service.listar(); }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar matéria por ID", description = "Retorna os detalhes de uma matéria específica.")
    public MateriaResponseDTO buscar(@PathVariable Long id) { return service.buscar(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cadastrar matéria", description = "Cria uma nova matéria.")
    public MateriaResponseDTO criar(@Valid @RequestBody CadastroMateriaDTO dto) { return service.criar(dto); }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar matéria", description = "Atualiza os dados de uma matéria existente.")
    public MateriaResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody AtualizacaoMateriaDTO dto) { return service.atualizar(id, dto); }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar matéria parcialmente", description = "Atualiza parcialmente os dados de uma matéria existente.")
    public MateriaResponseDTO atualizarParcial(@PathVariable Long id, @Valid @RequestBody AtualizacaoMateriaDTO dto) { return service.atualizar(id, dto); }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Excluir matéria", description = "Remove uma matéria pelo identificador.")
    public void excluir(@PathVariable Long id) { service.excluir(id); }
}
