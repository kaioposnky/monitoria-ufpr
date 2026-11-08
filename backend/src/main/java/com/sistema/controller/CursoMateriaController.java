package com.sistema.controller;

import com.sistema.dto.response.CursoMateriaResponseDTO;
import com.sistema.service.CursoMateriaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/v1/cursos-materias") @Tag(name = "Cursos e matérias")
public class CursoMateriaController {
    private final CursoMateriaService service;
    public CursoMateriaController(CursoMateriaService service) { this.service = service; }
    @GetMapping public List<CursoMateriaResponseDTO> listar() { return service.listar(); }
    @PostMapping("/{cursoId}/{materiaId}") @ResponseStatus(HttpStatus.CREATED)
    public CursoMateriaResponseDTO vincular(@PathVariable Long cursoId, @PathVariable Long materiaId) { return service.vincular(cursoId, materiaId); }
    @DeleteMapping("/{cursoId}/{materiaId}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desvincular(@PathVariable Long cursoId, @PathVariable Long materiaId) { service.desvincular(cursoId, materiaId); }
}
