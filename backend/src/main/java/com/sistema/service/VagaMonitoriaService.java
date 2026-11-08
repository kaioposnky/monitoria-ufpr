package com.sistema.service;

import com.sistema.dto.request.AtualizacaoParcialVagaMonitoriaDTO;
import com.sistema.dto.request.AtualizacaoVagaMonitoriaDTO;
import com.sistema.dto.request.CadastroVagaMonitoriaDTO;
import com.sistema.dto.response.VagaMonitoriaResponseDTO;
import com.sistema.entity.VagaMonitoria;
import com.sistema.exception.RecursoNaoEncontradoException;
import com.sistema.repository.VagaMonitoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VagaMonitoriaService {

    private final VagaMonitoriaRepository repository;

    public VagaMonitoriaService(VagaMonitoriaRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<VagaMonitoriaResponseDTO> listar() {
        return repository.findAll().stream().map(VagaMonitoriaResponseDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public VagaMonitoriaResponseDTO buscar(Long id) {
        return VagaMonitoriaResponseDTO.from(repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Vaga de monitoria não encontrada.")));
    }

    @Transactional
    public VagaMonitoriaResponseDTO criar(CadastroVagaMonitoriaDTO dto) {
        return VagaMonitoriaResponseDTO.from(repository.save(new VagaMonitoria(dto.materiaId(), dto.professorId(),
                dto.semestre(), dto.quantidadeVagas(), dto.tipoVaga(), dto.requisitos(), dto.descricao())));
    }

    @Transactional
    public VagaMonitoriaResponseDTO atualizar(Long id, AtualizacaoVagaMonitoriaDTO dto) {
        var vaga = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Vaga de monitoria não encontrada."));
        vaga.atualizar(dto.semestre(), dto.quantidadeVagas(), dto.tipoVaga(), dto.requisitos(),
                dto.descricao(), dto.status());
        return VagaMonitoriaResponseDTO.from(vaga);
    }

    @Transactional
    public VagaMonitoriaResponseDTO atualizarParcial(Long id, AtualizacaoParcialVagaMonitoriaDTO dto) {
        var vaga = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Vaga de monitoria não encontrada."));
        vaga.atualizar(dto.semestre() == null ? vaga.getSemestre() : dto.semestre(),
                dto.quantidadeVagas() == null ? vaga.getQuantidadeVagas() : dto.quantidadeVagas(),
                dto.tipoVaga() == null ? vaga.getTipoVaga() : dto.tipoVaga(),
                dto.requisitos() == null ? vaga.getRequisitos() : dto.requisitos(),
                dto.descricao() == null ? vaga.getDescricao() : dto.descricao(),
                dto.status() == null ? vaga.getStatus() : dto.status());
        return VagaMonitoriaResponseDTO.from(vaga);
    }

    @Transactional
    public void excluir(Long id) {
        if (!repository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Vaga de monitoria não encontrada.");
        }
        repository.deleteById(id);
    }
}
