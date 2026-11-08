package com.sistema.service;

import com.sistema.dto.request.*;
import com.sistema.dto.response.CursoResponseDTO;
import com.sistema.entity.Curso;
import com.sistema.exception.*;
import com.sistema.repository.CursoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CursoService {
    private final CursoRepository repository;
    public CursoService(CursoRepository repository) { this.repository = repository; }
    @Transactional(readOnly = true) public List<CursoResponseDTO> listar() { return repository.findAll().stream().map(CursoResponseDTO::from).toList(); }
    @Transactional(readOnly = true) public CursoResponseDTO buscar(Long id) { return CursoResponseDTO.from(repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Curso não encontrado."))); }
    @Transactional public CursoResponseDTO criar(CadastroCursoDTO d) { if (repository.existsByCodigo(d.codigo())) throw new RegraNegocioException("Código de curso já cadastrado."); return CursoResponseDTO.from(repository.save(new Curso(d.codigo(), d.nome(), d.setor()))); }
    @Transactional public CursoResponseDTO atualizar(Long id, AtualizacaoCursoDTO d) { Curso e = repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Curso não encontrado.")); e.atualizar(d.codigo(), d.nome(), d.setor()); return CursoResponseDTO.from(e); }
    @Transactional public void excluir(Long id) { if (!repository.existsById(id)) throw new RecursoNaoEncontradoException("Curso não encontrado."); repository.deleteById(id); }
}
