package com.sistema.controller;

import com.sistema.dto.request.*;
import com.sistema.dto.response.MateriaResponseDTO;
import com.sistema.service.MateriaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/v1/materias") @Tag(name = "Matérias")
public class MateriaController {
    private final MateriaService service;
    public MateriaController(MateriaService service) { this.service = service; }
    @GetMapping public List<MateriaResponseDTO> listar() { return service.listar(); }
    @GetMapping("/{id}") public MateriaResponseDTO buscar(@PathVariable Long id) { return service.buscar(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public MateriaResponseDTO criar(@Valid @RequestBody CadastroMateriaDTO dto) { return service.criar(dto); }
    @PutMapping("/{id}") public MateriaResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody AtualizacaoMateriaDTO dto) { return service.atualizar(id, dto); }
    @PatchMapping("/{id}") public MateriaResponseDTO atualizarParcial(@PathVariable Long id, @Valid @RequestBody AtualizacaoMateriaDTO dto) { return service.atualizar(id, dto); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void excluir(@PathVariable Long id) { service.excluir(id); }
}
