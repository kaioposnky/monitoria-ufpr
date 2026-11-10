package com.sistema.controller;

import com.sistema.dto.request.CadastroUsuarioDTO;
import com.sistema.dto.request.AtualizacaoUsuarioDTO;
import com.sistema.dto.response.UsuarioResponseDTO;
import com.sistema.service.UsuarioService;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/usuarios")
@Tag(name = "Usuários", description = "Operações de cadastro e consulta de usuários")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cadastrar usuário", description = "Cria um aluno, professor ou administrador.")
    public UsuarioResponseDTO cadastrar(@Valid @RequestBody CadastroUsuarioDTO dto) {
        return service.cadastrar(dto);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    @Operation(summary = "Listar usuários", description = "Retorna todos os usuários cadastrados.")
    public List<UsuarioResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR') or @accessGuard.isSelfOrAdmin(#id, authentication)")
    @Operation(summary = "Buscar usuário por ID", description = "Retorna os detalhes de um usuário específico.")
    public UsuarioResponseDTO buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar usuário", description = "Atualiza os dados de um usuário existente.")
    public UsuarioResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody AtualizacaoUsuarioDTO dto) {
        return service.atualizar(id, dto);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualizar usuário parcialmente", description = "Atualiza parcialmente os dados de um usuário existente.")
    public UsuarioResponseDTO atualizarParcial(@PathVariable Long id, @Valid @RequestBody AtualizacaoUsuarioDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Excluir usuário", description = "Remove um usuário pelo identificador.")
    public void excluir(@PathVariable Long id) {
        service.excluir(id);
    }
}
