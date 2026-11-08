package com.sistema.controller;

import com.sistema.dto.request.*;
import com.sistema.dto.response.CursoResponseDTO;
import com.sistema.service.CursoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/v1/cursos") @Tag(name = "Cursos")
public class CursoController {
    private final CursoService service;
    public CursoController(CursoService service) { this.service = service; }
    @GetMapping public List<CursoResponseDTO> listar() { return service.listar(); }
    @GetMapping("/{id}") public CursoResponseDTO buscar(@PathVariable Long id) { return service.buscar(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public CursoResponseDTO criar(@Valid @RequestBody CadastroCursoDTO dto) { return service.criar(dto); }
    @PutMapping("/{id}") public CursoResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody AtualizacaoCursoDTO dto) { return service.atualizar(id, dto); }
    @PatchMapping("/{id}") public CursoResponseDTO atualizarParcial(@PathVariable Long id, @Valid @RequestBody AtualizacaoCursoDTO dto) { return service.atualizar(id, dto); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void excluir(@PathVariable Long id) { service.excluir(id); }
}
