package com.sistema.controller;

import com.sistema.dto.request.AtualizacaoVagaMonitoriaDTO;
import com.sistema.dto.request.AtualizacaoParcialVagaMonitoriaDTO;
import com.sistema.dto.request.CadastroVagaMonitoriaDTO;
import com.sistema.dto.response.VagaMonitoriaResponseDTO;
import com.sistema.service.VagaMonitoriaService;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vagas-monitoria")
@Tag(name = "Vagas de monitoria", description = "Operações de consulta e atualização de vagas")
public class VagaMonitoriaController {

    private final VagaMonitoriaService service;

    public VagaMonitoriaController(VagaMonitoriaService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar vagas de monitoria")
    public List<VagaMonitoriaResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar vaga de monitoria por ID")
    public VagaMonitoriaResponseDTO buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VagaMonitoriaResponseDTO criar(@Valid @RequestBody CadastroVagaMonitoriaDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar vaga de monitoria")
    public VagaMonitoriaResponseDTO atualizar(@PathVariable Long id,
                                               @Valid @RequestBody AtualizacaoVagaMonitoriaDTO dto) {
        return service.atualizar(id, dto);
    }

    @PatchMapping("/{id}")
    public VagaMonitoriaResponseDTO atualizarParcial(@PathVariable Long id,
                                                      @RequestBody AtualizacaoParcialVagaMonitoriaDTO dto) {
        return service.atualizarParcial(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}
