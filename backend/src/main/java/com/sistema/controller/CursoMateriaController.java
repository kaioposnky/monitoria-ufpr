package com.sistema.controller;

import com.sistema.dto.response.CursoMateriaResponseDTO;
import com.sistema.service.CursoMateriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/cursos-materias")
@Tag(name = "Cursos e matérias", description = "Gerenciamento de vínculos entre cursos e matérias")
public class CursoMateriaController {
    private final CursoMateriaService service;
    public CursoMateriaController(CursoMateriaService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Listar vínculos curso-matéria", description = "Retorna todas as associações entre cursos e matérias.")
    public List<CursoMateriaResponseDTO> listar() { return service.listar(); }

    @PostMapping("/{cursoId}/{materiaId}")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Vincular matéria a curso", description = "Associa uma matéria existente a um curso.")
    public CursoMateriaResponseDTO vincular(@PathVariable Long cursoId, @PathVariable Long materiaId) { return service.vincular(cursoId, materiaId); }

    @DeleteMapping("/{cursoId}/{materiaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Desvincular matéria de curso", description = "Remove a associação entre um curso e uma matéria.")
    public void desvincular(@PathVariable Long cursoId, @PathVariable Long materiaId) { service.desvincular(cursoId, materiaId); }
}
