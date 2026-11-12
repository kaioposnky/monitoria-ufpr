package com.sistema.service;

import com.sistema.dto.request.AtualizacaoCandidaturaDTO;
import com.sistema.dto.request.AtualizacaoStatusCandidaturaDTO;
import com.sistema.dto.request.CadastroCandidaturaDTO;
import com.sistema.dto.response.CandidaturaResponseDTO;
import com.sistema.entity.Candidatura;
import com.sistema.entity.Usuario;
import com.sistema.entity.VagaMonitoria;
import com.sistema.exception.RecursoNaoEncontradoException;
import com.sistema.exception.RegraNegocioException;
import com.sistema.integration.IntegracaoExecutor;
import com.sistema.integration.notificacao.NotificacaoMensagem;
import com.sistema.integration.notificacao.Notificador;
import com.sistema.repository.CandidaturaRepository;
import com.sistema.repository.UsuarioRepository;
import com.sistema.repository.VagaMonitoriaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

@Service
public class CandidaturaService {

    private static final Logger log = LoggerFactory.getLogger(CandidaturaService.class);

    private final CandidaturaRepository repository;
    private final VagaMonitoriaRepository vagaRepository;
    private final UsuarioRepository usuarioRepository;
    private final Notificador notificador;
    private final Clock clock;

    public CandidaturaService(
            CandidaturaRepository repository,
            VagaMonitoriaRepository vagaRepository,
            UsuarioRepository usuarioRepository,
            Notificador notificador,
            Clock clock) {
        this.repository = repository;
        this.vagaRepository = vagaRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificador = notificador;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<CandidaturaResponseDTO> listar() {
        return repository.findAll().stream().map(CandidaturaResponseDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public CandidaturaResponseDTO buscar(Long id) {
        return CandidaturaResponseDTO.from(get(id));
    }

    @Transactional(readOnly = true)
    public List<CandidaturaResponseDTO> porVaga(Long id) {
        return repository.findByVagaId(id).stream().map(CandidaturaResponseDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public List<CandidaturaResponseDTO> porAluno(Long id) {
        return repository.findByAlunoId(id).stream().map(CandidaturaResponseDTO::from).toList();
    }

    @Transactional
    public CandidaturaResponseDTO criar(CadastroCandidaturaDTO d) {
        VagaMonitoria vaga = vagaRepository.findById(d.vagaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Vaga de monitoria não encontrada."));
        if (vaga.getStatus() != VagaMonitoria.StatusVaga.ABERTA) {
            throw new RegraNegocioException("Candidaturas só são aceitas para vagas com status ABERTA.");
        }
        validarJanelaInscricao(vaga);

        Usuario aluno = usuarioRepository.findById(d.alunoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Aluno não encontrado."));
        if (repository.existsByVagaIdAndAlunoId(d.vagaId(), d.alunoId())) {
            throw new RegraNegocioException("Aluno já se candidatou a esta vaga.");
        }

        Candidatura salva = repository.save(new Candidatura(
                d.vagaId(), d.alunoId(), d.notaDisciplina(), d.cr(), d.justificativa()));

        notificarCriacao(salva, vaga, aluno);
        return CandidaturaResponseDTO.from(salva);
    }

    @Transactional
    public CandidaturaResponseDTO atualizar(Long id, AtualizacaoCandidaturaDTO d) {
        Candidatura e = get(id);
        e.atualizar(d.notaDisciplina(), d.cr(), d.justificativa(), d.status());
        return CandidaturaResponseDTO.from(e);
    }

    @Transactional
    public CandidaturaResponseDTO status(Long id, AtualizacaoStatusCandidaturaDTO d) {
        Candidatura e = get(id);
        e.atualizar(e.getNotaDisciplina(), e.getCr(), e.getJustificativa(), d.status());
        notificarAvaliacao(e);
        return CandidaturaResponseDTO.from(e);
    }

    @Transactional
    public void excluir(Long id) {
        repository.delete(get(id));
    }

    private Candidatura get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Candidatura não encontrada."));
    }

    private void validarJanelaInscricao(VagaMonitoria vaga) {
        LocalDate hoje = LocalDate.now(clock);
        if (vaga.getDataAbertura() != null && hoje.isBefore(vaga.getDataAbertura())) {
            throw new RegraNegocioException("O período de inscrições para esta vaga ainda não iniciou.");
        }
        if (vaga.getDataEncerramento() != null && hoje.isAfter(vaga.getDataEncerramento())) {
            throw new RegraNegocioException("O período de inscrições para esta vaga já foi encerrado.");
        }
    }

    private void notificarCriacao(Candidatura candidatura, VagaMonitoria vaga, Usuario aluno) {
        IntegracaoExecutor.executarSemInterromper(log, "notificar nova candidatura " + candidatura.getId(), () -> {
            notificador.notificar(new NotificacaoMensagem(
                    aluno.getEmail(),
                    "Candidatura registrada (#" + candidatura.getId() + ")",
                    "Sua candidatura à vaga #" + vaga.getId() + " (" + vaga.getSemestre() + ") foi registrada.",
                    NotificacaoMensagem.TipoNotificacao.CANDIDATURA_REGISTRADA));

            usuarioRepository.findById(vaga.getProfessorId()).ifPresent(professor ->
                    notificador.notificar(new NotificacaoMensagem(
                            professor.getEmail(),
                            "Nova candidatura recebida na vaga #" + vaga.getId(),
                            "O aluno " + aluno.getNome() + " registrou candidatura para sua vaga.",
                            NotificacaoMensagem.TipoNotificacao.CANDIDATURA_REGISTRADA)));
        });
    }

    private void notificarAvaliacao(Candidatura candidatura) {
        IntegracaoExecutor.executarSemInterromper(log, "notificar avaliação candidatura " + candidatura.getId(), () ->
                usuarioRepository.findById(candidatura.getAlunoId()).ifPresent(aluno ->
                        notificador.notificar(new NotificacaoMensagem(
                                aluno.getEmail(),
                                "Atualização da candidatura #" + candidatura.getId(),
                                "Sua candidatura para a vaga #" + candidatura.getVagaId()
                                        + " foi atualizada para " + candidatura.getStatus() + ".",
                                NotificacaoMensagem.TipoNotificacao.CANDIDATURA_AVALIADA))));
    }
}
