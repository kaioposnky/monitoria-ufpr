package com.sistema.controller;

import com.sistema.dto.request.*;
import com.sistema.dto.response.RegistroAtividadeResponseDTO;
import com.sistema.service.RegistroAtividadeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/v1/registros-atividades") @Tag(name = "Registros de atividades")
public class RegistroAtividadeController {
    private final RegistroAtividadeService service;
    public RegistroAtividadeController(RegistroAtividadeService service) { this.service = service; }
    @GetMapping public List<RegistroAtividadeResponseDTO> listar() { return service.listar(); }
    @GetMapping("/{id}") public RegistroAtividadeResponseDTO buscar(@PathVariable Long id) { return service.buscar(id); }
    @GetMapping("/monitor/{monitorId}") public List<RegistroAtividadeResponseDTO> porMonitor(@PathVariable Long monitorId) { return service.porMonitor(monitorId); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public RegistroAtividadeResponseDTO criar(@Valid @RequestBody CadastroRegistroAtividadeDTO dto) { return service.criar(dto); }
    @PutMapping("/{id}") public RegistroAtividadeResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody AtualizacaoRegistroAtividadeDTO dto) { return service.atualizar(id, dto); }
    @PatchMapping("/{id}") public RegistroAtividadeResponseDTO atualizarParcial(@PathVariable Long id, @Valid @RequestBody AtualizacaoRegistroAtividadeDTO dto) { return service.atualizar(id, dto); }
    @PatchMapping("/{id}/aprovacao") public RegistroAtividadeResponseDTO aprovacao(@PathVariable Long id, @Valid @RequestBody AprovacaoRegistroAtividadeDTO dto) { return service.aprovacao(id, dto); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void excluir(@PathVariable Long id) { service.excluir(id); }
}
