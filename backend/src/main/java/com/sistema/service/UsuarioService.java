package com.sistema.service;

import com.sistema.dto.request.AtualizacaoUsuarioDTO;
import com.sistema.dto.request.CadastroUsuarioDTO;
import com.sistema.dto.response.UsuarioResponseDTO;
import com.sistema.entity.Usuario;
import com.sistema.exception.RecursoNaoEncontradoException;
import com.sistema.exception.RegraNegocioException;
import com.sistema.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public UsuarioResponseDTO cadastrar(CadastroUsuarioDTO dto) {
        if (repository.existsByEmail(dto.email())) {
            throw new RegraNegocioException("Já existe um usuário com este e-mail.");
        }
        return UsuarioResponseDTO.from(repository.save(new Usuario(dto.nome(), dto.email(),
                dto.tipoUsuario(), dto.matricula(), dto.cursoId())));
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listar() {
        return repository.findAll().stream().map(UsuarioResponseDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscar(Long id) {
        return UsuarioResponseDTO.from(repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado.")));
    }

    @Transactional
    public UsuarioResponseDTO atualizar(Long id, AtualizacaoUsuarioDTO dto) {
        var usuario = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
        if (repository.existsByEmailAndIdNot(dto.email(), id)) {
            throw new RegraNegocioException("Já existe um usuário com este e-mail.");
        }
        usuario.atualizar(dto.nome(), dto.email(), dto.matricula(), dto.cursoId(), dto.ativo());
        return UsuarioResponseDTO.from(usuario);
    }

    @Transactional
    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado.");
        }
        repository.deleteById(id);
    }
}
