package com.sistema.controller;

import com.sistema.dto.request.LoginRequestDTO;
import com.sistema.dto.response.AuthResponseDTO;
import com.sistema.dto.response.AuthUserDTO;
import com.sistema.entity.Monitor;
import com.sistema.entity.Usuario;
import com.sistema.exception.CredenciaisInvalidasException;
import com.sistema.exception.RecursoNaoEncontradoException;
import com.sistema.repository.MonitorRepository;
import com.sistema.repository.UsuarioRepository;
import com.sistema.security.AuthenticatedUser;
import com.sistema.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticação", description = "Login com JWT e consulta do usuário autenticado")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final MonitorRepository monitorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UsuarioRepository usuarioRepository,
            MonitorRepository monitorRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.monitorRepository = monitorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar usuário", description = "Valida e-mail e senha e retorna um token JWT junto aos dados do usuário.")
    public AuthResponseDTO login(@Valid @RequestBody LoginRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(dto.email().trim())
                .orElseThrow(() -> new CredenciaisInvalidasException("E-mail ou senha inválidos."));
        if (!usuario.isAtivo() || !passwordEncoder.matches(dto.senha(), usuario.getSenhaHash())) {
            throw new CredenciaisInvalidasException("E-mail ou senha inválidos.");
        }
        String token = jwtService.gerarToken(usuario);
        return new AuthResponseDTO(token, toAuthUser(usuario));
    }

    @GetMapping("/me")
    @Operation(summary = "Consultar usuário autenticado", description = "Retorna os dados e o papel do usuário autenticado pelo token JWT.")
    public AuthUserDTO me(@AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) {
            throw new CredenciaisInvalidasException("Sessão inválida ou expirada.");
        }
        Usuario usuario = usuarioRepository.findById(principal.id())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
        return toAuthUser(usuario);
    }

    private AuthUserDTO toAuthUser(Usuario usuario) {
        boolean isMonitor = usuario.getTipoUsuario() == Usuario.TipoUsuario.ALUNO
                && monitorRepository.existsByAlunoIdAndStatus(usuario.getId(), Monitor.StatusMonitor.ATIVO);
        return AuthUserDTO.from(usuario, isMonitor);
    }
}
