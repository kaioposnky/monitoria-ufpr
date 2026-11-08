package com.sistema.controller;

import com.sistema.dto.request.*;
import com.sistema.dto.response.HorarioAtendimentoResponseDTO;
import com.sistema.service.HorarioAtendimentoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/v1/horarios-atendimento") @Tag(name = "Horários de atendimento")
public class HorarioAtendimentoController {
    private final HorarioAtendimentoService service;
    public HorarioAtendimentoController(HorarioAtendimentoService service) { this.service = service; }
    @GetMapping public List<HorarioAtendimentoResponseDTO> listar() { return service.listar(); }
    @GetMapping("/{id}") public HorarioAtendimentoResponseDTO buscar(@PathVariable Long id) { return service.buscar(id); }
    @GetMapping("/monitor/{monitorId}") public List<HorarioAtendimentoResponseDTO> porMonitor(@PathVariable Long monitorId) { return service.porMonitor(monitorId); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public HorarioAtendimentoResponseDTO criar(@Valid @RequestBody CadastroHorarioAtendimentoDTO dto) { return service.criar(dto); }
    @PutMapping("/{id}") public HorarioAtendimentoResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody AtualizacaoHorarioAtendimentoDTO dto) { return service.atualizar(id, dto); }
    @PatchMapping("/{id}") public HorarioAtendimentoResponseDTO atualizarParcial(@PathVariable Long id, @Valid @RequestBody AtualizacaoHorarioAtendimentoDTO dto) { return service.atualizar(id, dto); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void excluir(@PathVariable Long id) { service.excluir(id); }
}
