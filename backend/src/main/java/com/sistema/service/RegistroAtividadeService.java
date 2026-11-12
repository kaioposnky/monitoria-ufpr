package com.sistema.service;

import com.sistema.dto.request.AprovacaoRegistroAtividadeDTO;
import com.sistema.dto.request.AtualizacaoRegistroAtividadeDTO;
import com.sistema.dto.request.CadastroRegistroAtividadeDTO;
import com.sistema.dto.response.RegistroAtividadeResponseDTO;
import com.sistema.entity.RegistroAtividade;
import com.sistema.exception.RecursoNaoEncontradoException;
import com.sistema.exception.RegraNegocioException;
import com.sistema.integration.IntegracaoExecutor;
import com.sistema.integration.notificacao.NotificacaoMensagem;
import com.sistema.integration.notificacao.Notificador;
import com.sistema.repository.MonitorRepository;
import com.sistema.repository.RegistroAtividadeRepository;
import com.sistema.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
public class RegistroAtividadeService {

    private static final Logger log = LoggerFactory.getLogger(RegistroAtividadeService.class);

    private final RegistroAtividadeRepository repository;
    private final MonitorRepository monitorRepository;
    private final UsuarioRepository usuarioRepository;
    private final Notificador notificador;

    public RegistroAtividadeService(
            RegistroAtividadeRepository repository,
            MonitorRepository monitorRepository,
            UsuarioRepository usuarioRepository,
            Notificador notificador) {
        this.repository = repository;
        this.monitorRepository = monitorRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificador = notificador;
    }

    @Transactional(readOnly = true)
    public List<RegistroAtividadeResponseDTO> listar() {
        return repository.findAll().stream().map(RegistroAtividadeResponseDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public RegistroAtividadeResponseDTO buscar(Long id) {
        return RegistroAtividadeResponseDTO.from(get(id));
    }

    @Transactional(readOnly = true)
    public List<RegistroAtividadeResponseDTO> porMonitor(Long id) {
        return repository.findByMonitorId(id).stream().map(RegistroAtividadeResponseDTO::from).toList();
    }

    @Transactional
    public RegistroAtividadeResponseDTO criar(CadastroRegistroAtividadeDTO d) {
        validar(d.horaInicio(), d.horaFim());
        if (!monitorRepository.existsById(d.monitorId())) {
            throw new RecursoNaoEncontradoException("Monitor não encontrado.");
        }
        return RegistroAtividadeResponseDTO.from(repository.save(new RegistroAtividade(
                d.monitorId(), d.dataAtividade(), d.horaInicio(), d.horaFim(),
                d.tipoAtividade(), d.descricao(), d.quantidadeAlunosAtendidos())));
    }

    @Transactional
    public RegistroAtividadeResponseDTO atualizar(Long id, AtualizacaoRegistroAtividadeDTO d) {
        validar(d.horaInicio(), d.horaFim());
        RegistroAtividade e = get(id);
        e.atualizar(d.dataAtividade(), d.horaInicio(), d.horaFim(), d.tipoAtividade(),
                d.descricao(), d.quantidadeAlunosAtendidos());
        return RegistroAtividadeResponseDTO.from(e);
    }

    @Transactional
    public RegistroAtividadeResponseDTO aprovacao(Long id, AprovacaoRegistroAtividadeDTO d) {
        RegistroAtividade e = get(id);
        e.atualizarAprovacao(d.statusAprovacao(), d.feedbackProfessor());
        notificarAvaliacao(e);
        return RegistroAtividadeResponseDTO.from(e);
    }

    @Transactional
    public void excluir(Long id) {
        repository.delete(get(id));
    }

    private RegistroAtividade get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Registro de atividade não encontrado."));
    }

    private void validar(LocalTime inicio, LocalTime fim) {
        if (!fim.isAfter(inicio)) {
            throw new RegraNegocioException("Hora final deve ser posterior à hora inicial.");
        }
    }

    private void notificarAvaliacao(RegistroAtividade registro) {
        IntegracaoExecutor.executarSemInterromper(log, "notificar avaliação atividade " + registro.getId(), () ->
                monitorRepository.findById(registro.getMonitorId())
                        .flatMap(monitor -> usuarioRepository.findById(monitor.getAlunoId()))
                        .ifPresent(aluno -> notificador.notificar(new NotificacaoMensagem(
                                aluno.getEmail(),
                                "Registro de atividade #" + registro.getId() + " avaliado",
                                "Seu registro de atividade de " + registro.getDataAtividade()
                                        + " recebeu status " + registro.getStatusAprovacao() + ".",
                                NotificacaoMensagem.TipoNotificacao.ATIVIDADE_AVALIADA))));
    }
}
