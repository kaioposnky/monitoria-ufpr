package com.sistema.controller;

import com.sistema.dto.response.CursoDisciplinaResponseDTO;
import com.sistema.service.CursoDisciplinaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cursos-disciplinas")
@Tag(name = "Cursos e disciplinas", description = "Gerenciamento de vínculos N:N entre cursos e disciplinas")
public class CursoDisciplinaController {
    private final CursoDisciplinaService service;

    public CursoDisciplinaController(CursoDisciplinaService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar vínculos curso-disciplina", description = "Retorna todas as associações entre cursos e disciplinas.")
    public List<CursoDisciplinaResponseDTO> listar() {
        return service.listar();
    }

    @PostMapping("/{cursoId}/{disciplinaId}")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Vincular disciplina a curso", description = "Associa uma disciplina existente a um curso.")
    public CursoDisciplinaResponseDTO vincular(@PathVariable Long cursoId, @PathVariable Long disciplinaId) {
        return service.vincular(cursoId, disciplinaId);
    }

    @DeleteMapping("/{cursoId}/{disciplinaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Desvincular disciplina de curso", description = "Remove a associação entre um curso e uma disciplina.")
    public void desvincular(@PathVariable Long cursoId, @PathVariable Long disciplinaId) {
        service.desvincular(cursoId, disciplinaId);
    }
}
